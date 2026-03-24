struct Globals {
    view_proj: mat4x4<f32>,
    model: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> globals: Globals;

struct VsOut {
    @builtin(position) clip_pos: vec4<f32>,
    @location(0) color: vec3<f32>,
    @location(1) world_pos: vec3<f32>,
}

@vertex
fn vs_main(
    @location(0) pos: vec3<f32>,
    @location(1) color: vec3<f32>,
) -> VsOut {
    var o: VsOut;
    let world = globals.model * vec4<f32>(pos, 1.0);
    o.clip_pos = globals.view_proj * world;
    o.color = color;
    o.world_pos = world.xyz;
    return o;
}

@fragment
fn fs_main(in: VsOut) -> @location(0) vec4<f32> {
    let fog_color = vec3<f32>(0.02, 0.04, 0.12);
    let dist = length(in.world_pos);
    let fog = smoothstep(9.0, 24.0, dist);
    let rgb = mix(in.color, fog_color, fog);
    return vec4<f32>(rgb, 1.0);
}
