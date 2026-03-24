use crate::game::Game;
use glam::{Mat4, Vec3};
use wgpu::util::DeviceExt;

#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
pub struct Vertex {
    pub pos: [f32; 3],
    pub color: [f32; 3],
}

#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
struct Globals {
    view_proj: [[f32; 4]; 4],
    model: [[f32; 4]; 4],
}

pub struct Scene3d {
    pub pipeline: wgpu::RenderPipeline,
    pub uniform_buffer: wgpu::Buffer,
    pub bind_group: wgpu::BindGroup,
    uniform_stride: u32,
    pub static_vb: wgpu::Buffer,
    pub static_ib: wgpu::Buffer,
    pub static_indices: u32,
    pub player_vb: wgpu::Buffer,
    pub npc_vb: wgpu::Buffer,
    pub cube_ib: wgpu::Buffer,
    pub cube_indices: u32,
    depth: Option<(wgpu::Texture, wgpu::TextureView)>,
    depth_format: wgpu::TextureFormat,
}

fn cube_mesh() -> (Vec<Vertex>, Vec<u32>) {
    let s = 0.5_f32;
    let c = [0.75, 0.72, 0.65];
    let verts = [
        Vertex {
            pos: [-s, -s, s],
            color: c,
        },
        Vertex {
            pos: [s, -s, s],
            color: c,
        },
        Vertex {
            pos: [s, s, s],
            color: c,
        },
        Vertex {
            pos: [-s, s, s],
            color: c,
        },
        Vertex {
            pos: [-s, -s, -s],
            color: c,
        },
        Vertex {
            pos: [s, -s, -s],
            color: c,
        },
        Vertex {
            pos: [s, s, -s],
            color: c,
        },
        Vertex {
            pos: [-s, s, -s],
            color: c,
        },
    ];
    let idx: [u32; 36] = [
        0, 1, 2, 2, 3, 0, 4, 6, 5, 6, 4, 7, 0, 3, 7, 7, 4, 0, 1, 5, 6, 6, 2, 1, 3, 2, 6, 6, 7, 3,
        0, 4, 5, 5, 1, 0,
    ];
    (verts.to_vec(), idx.to_vec())
}

fn merge_cube_at(
    out_v: &mut Vec<Vertex>,
    out_i: &mut Vec<u32>,
    center: Vec3,
    scale: Vec3,
    color: [f32; 3],
) {
    let (mut v, mut i) = cube_mesh();
    let base = out_v.len() as u32;
    for x in &mut v {
        x.pos[0] = x.pos[0] * scale.x + center.x;
        x.pos[1] = x.pos[1] * scale.y + center.y;
        x.pos[2] = x.pos[2] * scale.z + center.z;
        x.color = color;
    }
    out_v.extend(v);
    for x in &mut i {
        *x += base;
    }
    out_i.extend(i);
}

fn static_world() -> (Vec<Vertex>, Vec<u32>) {
    let mut v = Vec::new();
    let mut i = Vec::new();
    let half = 14.0_f32;
    let sand = [0.35, 0.28, 0.18];
    let stone = [0.22, 0.22, 0.26];
    let base = v.len() as u32;
    v.extend([
        Vertex {
            pos: [-half, 0.0, -half],
            color: sand,
        },
        Vertex {
            pos: [half, 0.0, -half],
            color: sand,
        },
        Vertex {
            pos: [half, 0.0, half],
            color: sand,
        },
        Vertex {
            pos: [-half, 0.0, half],
            color: sand,
        },
    ]);
    i.extend([base, base + 1, base + 2, base + 2, base + 3, base]);

    merge_cube_at(
        &mut v,
        &mut i,
        Vec3::new(4.0, 1.25, -5.0),
        Vec3::new(0.9, 2.5, 0.9),
        stone,
    );
    merge_cube_at(
        &mut v,
        &mut i,
        Vec3::new(-6.0, 1.0, 1.0),
        Vec3::new(1.1, 2.0, 1.1),
        stone,
    );
    merge_cube_at(
        &mut v,
        &mut i,
        Vec3::new(1.0, 0.75, 8.0),
        Vec3::new(1.4, 1.5, 1.4),
        stone,
    );
    (v, i)
}

impl Scene3d {
    pub fn new(device: &wgpu::Device, format: wgpu::TextureFormat) -> Self {
        let align = device.limits().min_uniform_buffer_offset_alignment;
        let stride = ((std::mem::size_of::<Globals>() as u32 + align - 1) / align) * align;

        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("scene"),
            source: wgpu::ShaderSource::Wgsl(include_str!("../shaders/scene.wgsl").into()),
        });

        let bind_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("scene_globals"),
            entries: &[wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: true,
                    min_binding_size: std::num::NonZeroU64::new(
                        std::mem::size_of::<Globals>() as u64
                    ),
                },
                count: None,
            }],
        });

        let uniform_buffer = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("scene_uniform"),
            size: u64::from(stride) * 3,
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });

        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("scene_bind"),
            layout: &bind_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding {
                    buffer: &uniform_buffer,
                    offset: 0,
                    size: std::num::NonZeroU64::new(std::mem::size_of::<Globals>() as u64),
                }),
            }],
        });

        let depth_format = wgpu::TextureFormat::Depth32Float;
        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("scene_pl"),
            bind_group_layouts: &[&bind_layout],
            push_constant_ranges: &[],
        });

        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("scene_pipe"),
            layout: Some(&pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("vs_main"),
                buffers: &[wgpu::VertexBufferLayout {
                    array_stride: std::mem::size_of::<Vertex>() as u64,
                    step_mode: wgpu::VertexStepMode::Vertex,
                    attributes: &wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x3],
                }],
                compilation_options: Default::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("fs_main"),
                targets: &[Some(wgpu::ColorTargetState {
                    format,
                    blend: Some(wgpu::BlendState::REPLACE),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState {
                cull_mode: Some(wgpu::Face::Back),
                ..Default::default()
            },
            depth_stencil: Some(wgpu::DepthStencilState {
                format: depth_format,
                depth_write_enabled: true,
                depth_compare: wgpu::CompareFunction::Less,
                stencil: wgpu::StencilState::default(),
                bias: wgpu::DepthBiasState::default(),
            }),
            multisample: wgpu::MultisampleState::default(),
            multiview: None,
            cache: None,
        });

        let (sv, si) = static_world();
        let static_indices = si.len() as u32;
        let static_vb = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("static_vb"),
            contents: bytemuck::cast_slice(&sv),
            usage: wgpu::BufferUsages::VERTEX,
        });
        let static_ib = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("static_ib"),
            contents: bytemuck::cast_slice(&si),
            usage: wgpu::BufferUsages::INDEX,
        });

        let (cv, ci) = cube_mesh();
        let cube_indices = ci.len() as u32;
        let mut pv = cv.clone();
        for x in &mut pv {
            x.color = [0.42, 0.52, 0.88];
        }
        let mut nv = cv;
        for x in &mut nv {
            x.color = [0.32, 0.52, 0.30];
        }
        let player_vb = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("player_vb"),
            contents: bytemuck::cast_slice(&pv),
            usage: wgpu::BufferUsages::VERTEX,
        });
        let npc_vb = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("npc_vb"),
            contents: bytemuck::cast_slice(&nv),
            usage: wgpu::BufferUsages::VERTEX,
        });
        let cube_ib = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("cube_ib"),
            contents: bytemuck::cast_slice(&ci),
            usage: wgpu::BufferUsages::INDEX,
        });

        Self {
            pipeline,
            uniform_buffer,
            bind_group,
            uniform_stride: stride,
            static_vb,
            static_ib,
            static_indices,
            player_vb,
            npc_vb,
            cube_ib,
            cube_indices,
            depth: None,
            depth_format,
        }
    }

    pub fn ensure_depth(&mut self, device: &wgpu::Device, width: u32, height: u32) {
        if width == 0 || height == 0 {
            return;
        }
        let need_new = self
            .depth
            .as_ref()
            .map(|(t, _)| t.width() != width || t.height() != height)
            .unwrap_or(true);
        if !need_new {
            return;
        }
        let tex = device.create_texture(&wgpu::TextureDescriptor {
            label: Some("depth"),
            size: wgpu::Extent3d {
                width,
                height,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: self.depth_format,
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            view_formats: &[],
        });
        let view = tex.create_view(&wgpu::TextureViewDescriptor::default());
        self.depth = Some((tex, view));
    }

    pub fn depth_view(&self) -> Option<&wgpu::TextureView> {
        self.depth.as_ref().map(|(_, v)| v)
    }

    fn write_slot(queue: &wgpu::Queue, buffer: &wgpu::Buffer, stride: u32, slot: u32, g: &Globals) {
        queue.write_buffer(buffer, u64::from(stride * slot), bytemuck::bytes_of(g));
    }

    pub fn prepare_uniforms(&self, queue: &wgpu::Queue, game: &Game, aspect: f32) {
        let proj = Mat4::perspective_rh(55_f32.to_radians(), aspect.max(0.1), 0.1, 200.0);
        let view = game.view_matrix();
        let vp = proj * view;

        let g0 = Globals {
            view_proj: vp.to_cols_array_2d(),
            model: Mat4::IDENTITY.to_cols_array_2d(),
        };
        let g1 = Globals {
            view_proj: vp.to_cols_array_2d(),
            model: Mat4::from_translation(game.player_pos + Vec3::Y * 0.85).to_cols_array_2d(),
        };
        let g2 = Globals {
            view_proj: vp.to_cols_array_2d(),
            model: Mat4::from_translation(game.npc_pos + Vec3::Y * 0.85).to_cols_array_2d(),
        };

        Self::write_slot(queue, &self.uniform_buffer, self.uniform_stride, 0, &g0);
        Self::write_slot(queue, &self.uniform_buffer, self.uniform_stride, 1, &g1);
        Self::write_slot(queue, &self.uniform_buffer, self.uniform_stride, 2, &g2);
    }

    pub fn draw(&self, render_pass: &mut wgpu::RenderPass<'_>) {
        render_pass.set_pipeline(&self.pipeline);

        render_pass.set_bind_group(0, &self.bind_group, &[0]);
        render_pass.set_vertex_buffer(0, self.static_vb.slice(..));
        render_pass.set_index_buffer(self.static_ib.slice(..), wgpu::IndexFormat::Uint32);
        render_pass.draw_indexed(0..self.static_indices, 0, 0..1);

        render_pass.set_bind_group(0, &self.bind_group, &[self.uniform_stride]);
        render_pass.set_vertex_buffer(0, self.player_vb.slice(..));
        render_pass.set_index_buffer(self.cube_ib.slice(..), wgpu::IndexFormat::Uint32);
        render_pass.draw_indexed(0..self.cube_indices, 0, 0..1);

        render_pass.set_bind_group(0, &self.bind_group, &[self.uniform_stride * 2]);
        render_pass.set_vertex_buffer(0, self.npc_vb.slice(..));
        render_pass.draw_indexed(0..self.cube_indices, 0, 0..1);
    }
}
