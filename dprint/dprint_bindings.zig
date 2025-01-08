// https://github.com/dprint/dprint/blob/main/docs/wasm-plugin-development.md
const std = @import("std");
const fs = std.fs;
const path = std.fs.path;
const builtin = std.builtin;

const wasm_alloc = std.heap.wasm_allocator;

const LICENSE = @embedFile("../LICENSE");

export fn dprint_plugin_version_4() i32 {
    return 4;
}
export fn get_plugin_info() i32 {}

export fn register_config(config_id: i32) i32 {
    _ = config_id; // autofix
}

export fn release_config(config_id: i32) i32 {
    _ = config_id; // autofix
}

export fn get_config_diagnostics(config_id: i32) i32 {
    _ = config_id; // autofix

}

export fn get_resolved_config(config_id: i32) i32 {
    _ = config_id; // autofix
}

export fn get_license_text() i32 {}

// Low level communication
// Dprint wasm plugin use this to shared the common memory.

export fn get_shared_bytes_ptr() !void {}

export fn clear_shared_bytes() !void {}
