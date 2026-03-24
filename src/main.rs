mod game;
mod render3d;

use std::sync::Arc;
use std::time::Instant;

use egui::ViewportId;
use game::{Game, GameMode};
use render3d::Scene3d;
use winit::application::ApplicationHandler;
use winit::event::ElementState;
use winit::event::WindowEvent;
use winit::event_loop::ActiveEventLoop;
use winit::event_loop::ControlFlow;
use winit::event_loop::EventLoop;
use winit::keyboard::{KeyCode, PhysicalKey};
use winit::window::Window;

struct Gfx {
    #[allow(dead_code)]
    _window: Arc<Window>,
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    scene: Scene3d,
    format: wgpu::TextureFormat,
}

impl Gfx {
    async fn new(window: Arc<Window>) -> Self {
        let size = window.inner_size();
        let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor::default());
        let surface = instance.create_surface(window.clone()).expect("surface");
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::HighPerformance,
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .expect("adapter");

        let caps = surface.get_capabilities(&adapter);
        // egui-wgpu предупреждает о линейном framebuffer при sRGB swapchain — берём несRGB, если есть.
        let format = caps
            .formats
            .iter()
            .find(|f| !f.is_srgb())
            .copied()
            .unwrap_or(caps.formats[0]);

        let mut config = surface
            .get_default_config(&adapter, size.width.max(1), size.height.max(1))
            .expect("surface config");
        config.format = format;

        let (device, queue) = adapter
            .request_device(&wgpu::DeviceDescriptor {
                label: Some("device"),
                required_features: wgpu::Features::empty(),
                required_limits: wgpu::Limits::default(),
                memory_hints: Default::default(),
                trace: wgpu::Trace::default(),
            })
            .await
            .expect("device");

        surface.configure(&device, &config);
        let mut scene = Scene3d::new(&device, format);
        scene.ensure_depth(&device, config.width, config.height);

        Self {
            _window: window,
            surface,
            device,
            queue,
            config,
            scene,
            format,
        }
    }

    fn resize(&mut self, width: u32, height: u32) {
        if width == 0 || height == 0 {
            return;
        }
        self.config.width = width;
        self.config.height = height;
        self.surface.configure(&self.device, &self.config);
        self.scene.ensure_depth(&self.device, width, height);
    }

    fn render_frame(
        &mut self,
        game: &Game,
        egui_ctx: &egui::Context,
        egui_winit: &mut egui_winit::State,
        egui_renderer: &mut egui_wgpu::Renderer,
        window: &Window,
    ) -> Result<(), wgpu::SurfaceError> {
        let size = window.inner_size();
        let (w, h) = (size.width.max(1), size.height.max(1));
        let aspect = w as f32 / h as f32;

        self.scene.prepare_uniforms(&self.queue, game, aspect);

        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());
        let depth_view = self.scene.depth_view().ok_or(wgpu::SurfaceError::Lost)?;

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("main"),
            });

        let raw_input = egui_winit.take_egui_input(window);
        let full_output = egui_ctx.run(raw_input, |ctx| {
            if game.mode == GameMode::Dialog {
                egui::Window::new("Старый отшельник")
                    .collapsible(false)
                    .resizable(false)
                    .anchor(egui::Align2::CENTER_CENTER, [0.0, 0.0])
                    .show(ctx, |ui| {
                        ui.label("Ты нашёл руины старого круга. Драконы спят — пока.");
                        ui.label("Гоблины на восточной тропе шумят по ночам. Будь осторожен.");
                        ui.separator();
                        ui.label("Esc — закрыть");
                    });
            } else if game.near_npc() {
                egui::Area::new(egui::Id::new("hint"))
                    .anchor(egui::Align2::CENTER_BOTTOM, [0.0, -24.0])
                    .show(ctx, |ui| {
                        ui.label(egui::RichText::new("E — поговорить").strong());
                    });
            }
        });
        egui_winit.handle_platform_output(window, full_output.platform_output);

        for (id, image_delta) in &full_output.textures_delta.set {
            egui_renderer.update_texture(&self.device, &self.queue, *id, image_delta);
        }

        let paint_jobs = egui_ctx.tessellate(full_output.shapes, full_output.pixels_per_point);
        let screen_descriptor = egui_wgpu::ScreenDescriptor {
            size_in_pixels: [w, h],
            pixels_per_point: egui_winit::pixels_per_point(egui_ctx, window),
        };
        let extra = egui_renderer.update_buffers(
            &self.device,
            &self.queue,
            &mut encoder,
            &paint_jobs,
            &screen_descriptor,
        );

        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("scene+ui"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.02,
                            g: 0.04,
                            b: 0.12,
                            a: 1.0,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: depth_view,
                    depth_ops: Some(wgpu::Operations {
                        load: wgpu::LoadOp::Clear(1.0),
                        store: wgpu::StoreOp::Store,
                    }),
                    stencil_ops: None,
                }),
                occlusion_query_set: None,
                timestamp_writes: None,
            });
            self.scene.draw(&mut pass);
            egui_renderer.render(&mut pass.forget_lifetime(), &paint_jobs, &screen_descriptor);
        }

        for id in &full_output.textures_delta.free {
            egui_renderer.free_texture(id);
        }

        self.queue
            .submit(extra.into_iter().chain(std::iter::once(encoder.finish())));
        output.present();
        Ok(())
    }
}

struct App {
    window: Option<Arc<Window>>,
    gfx: Option<Gfx>,
    game: Game,
    egui_ctx: egui::Context,
    egui_winit: Option<egui_winit::State>,
    egui_renderer: Option<egui_wgpu::Renderer>,
    last_frame: Instant,
}

impl App {
    fn new() -> Self {
        Self {
            window: None,
            gfx: None,
            game: Game::new(),
            egui_ctx: egui::Context::default(),
            egui_winit: None,
            egui_renderer: None,
            last_frame: Instant::now(),
        }
    }
}

impl ApplicationHandler for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        event_loop.set_control_flow(ControlFlow::Poll);
        if self.window.is_some() {
            return;
        }
        let win_attrs = Window::default_attributes()
            .with_title("Fantasy — руины (wgpu)")
            .with_inner_size(winit::dpi::LogicalSize::new(1100, 700));
        let window = Arc::new(event_loop.create_window(win_attrs).expect("window"));
        self.window = Some(window.clone());

        let max_tex = 4096;
        let egui_state = egui_winit::State::new(
            self.egui_ctx.clone(),
            ViewportId::ROOT,
            window.as_ref(),
            None,
            None,
            Some(max_tex),
        );

        let gfx = pollster::block_on(Gfx::new(window.clone()));
        let egui_renderer = egui_wgpu::Renderer::new(
            &gfx.device,
            gfx.format,
            Some(wgpu::TextureFormat::Depth32Float),
            1,
            false,
        );

        self.egui_winit = Some(egui_state);
        self.egui_renderer = Some(egui_renderer);
        self.gfx = Some(gfx);
        self.last_frame = Instant::now();
        window.request_redraw();
    }

    fn window_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _id: winit::window::WindowId,
        event: WindowEvent,
    ) {
        let Some(window) = self.window.clone() else {
            return;
        };

        if let WindowEvent::KeyboardInput { event: ke, .. } = &event {
            if ke.state == ElementState::Pressed {
                if let PhysicalKey::Code(KeyCode::Escape) = ke.physical_key {
                    if self.game.mode == GameMode::Dialog {
                        self.game.close_dialog();
                    }
                }
            }
        }

        let consumed = if let Some(st) = self.egui_winit.as_mut() {
            st.on_window_event(window.as_ref(), &event).consumed
        } else {
            false
        };

        if let WindowEvent::KeyboardInput { event: ke, .. } = &event {
            if let PhysicalKey::Code(code) = ke.physical_key {
                self.game.set_key(code, ke.state == ElementState::Pressed);
                if !consumed && ke.state == ElementState::Pressed && code == KeyCode::KeyE {
                    self.game.open_dialog();
                }
            }
        }

        match event {
            WindowEvent::CloseRequested => {
                event_loop.exit();
            }
            WindowEvent::Resized(ns) => {
                if let Some(g) = self.gfx.as_mut() {
                    g.resize(ns.width, ns.height);
                }
                window.request_redraw();
            }
            WindowEvent::RedrawRequested => {
                let now = Instant::now();
                let dt = (now - self.last_frame).as_secs_f32().min(0.1);
                self.last_frame = now;
                self.game.tick(dt);

                let Some(gfx) = self.gfx.as_mut() else {
                    return;
                };
                let Some(egui_winit) = self.egui_winit.as_mut() else {
                    return;
                };
                let Some(egui_renderer) = self.egui_renderer.as_mut() else {
                    return;
                };
                if let Err(e) = gfx.render_frame(
                    &self.game,
                    &self.egui_ctx,
                    egui_winit,
                    egui_renderer,
                    window.as_ref(),
                ) {
                    log::warn!("render: {e:?}");
                    if matches!(e, wgpu::SurfaceError::Lost | wgpu::SurfaceError::Outdated) {
                        let s = window.inner_size();
                        gfx.resize(s.width, s.height);
                    }
                }
                window.request_redraw();
            }
            _ => {}
        }
    }

    fn about_to_wait(&mut self, _event_loop: &ActiveEventLoop) {
        if let Some(w) = &self.window {
            w.request_redraw();
        }
    }
}

fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("warn")).init();
    let event_loop = EventLoop::new().expect("loop");
    let mut app = App::new();
    event_loop.run_app(&mut app).expect("run");
}
