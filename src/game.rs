use glam::{Mat4, Vec3};
use winit::keyboard::KeyCode;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum GameMode {
    Playing,
    Dialog,
}

pub struct Game {
    pub mode: GameMode,
    pub player_pos: Vec3,
    pub yaw: f32,
    pub npc_pos: Vec3,
    keys: [bool; 256],
}

impl Game {
    pub const INTERACT_RADIUS: f32 = 2.75;
    pub const MOVE_SPEED: f32 = 4.5;

    pub fn new() -> Self {
        Self {
            mode: GameMode::Playing,
            player_pos: Vec3::new(0.0, 0.0, 4.0),
            yaw: std::f32::consts::PI,
            npc_pos: Vec3::new(5.0, 0.0, 2.0),
            keys: [false; 256],
        }
    }

    pub fn set_key(&mut self, code: KeyCode, down: bool) {
        let i = code as usize;
        if i < 256 {
            self.keys[i] = down;
        }
    }

    pub fn key(&self, code: KeyCode) -> bool {
        let i = code as usize;
        if i < 256 {
            self.keys[i]
        } else {
            false
        }
    }

    pub fn near_npc(&self) -> bool {
        self.player_pos.distance(self.npc_pos) <= Self::INTERACT_RADIUS
    }

    pub fn open_dialog(&mut self) {
        if self.mode == GameMode::Playing && self.near_npc() {
            self.mode = GameMode::Dialog;
        }
    }

    pub fn close_dialog(&mut self) {
        if self.mode == GameMode::Dialog {
            self.mode = GameMode::Playing;
        }
    }

    pub fn tick(&mut self, dt: f32) {
        if self.mode == GameMode::Dialog {
            return;
        }

        let mut move_dir = Vec3::ZERO;
        if self.key(KeyCode::KeyW) {
            move_dir += Vec3::new(self.yaw.sin(), 0.0, self.yaw.cos());
        }
        if self.key(KeyCode::KeyS) {
            move_dir -= Vec3::new(self.yaw.sin(), 0.0, self.yaw.cos());
        }
        if self.key(KeyCode::KeyA) {
            self.yaw += 1.8 * dt;
        }
        if self.key(KeyCode::KeyD) {
            self.yaw -= 1.8 * dt;
        }

        if move_dir.length_squared() > 0.0 {
            move_dir = move_dir.normalize() * Self::MOVE_SPEED * dt;
            self.player_pos += move_dir;
        }

        self.player_pos.y = 0.0;
    }

    pub fn view_matrix(&self) -> Mat4 {
        let cam_offset = Vec3::new(self.yaw.sin() * -7.0, 5.5, self.yaw.cos() * -7.0);
        let eye = self.player_pos + cam_offset;
        let target = self.player_pos + Vec3::Y * 1.2;
        Mat4::look_at_rh(eye, target, Vec3::Y)
    }
}
