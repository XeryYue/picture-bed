const std = @import("std");
const c = @import("c.zig");
const ini = @import("zig-ini");
const transalte = @import("translate.zig");

const assert = std.debug.assert;
const c_alloc = std.heap.c_allocator;

var napi_null: c.napi_value = undefined;

// NAPI_MODULE is a macro warp napi_register_module_version fn.

/// N-API will call this constructor automatically to register the module.
export fn napi_register_module_v1(env: c.napi_env, exports: c.napi_value) c.napi_value {
    napi_null = transalte.capture_null(env) catch return null;
    transalte.register_function(env, exports, "format", format) catch return null;
    return exports;
}

fn format(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const args = transalte.extract_args(env, info, .{
        .count = 2,
        .function = "format",
    }) catch return null;

    const input_str = transalte.js_str_from_value(env, args[0]) catch return null;

    const fmt_options = ini.FmtOptions{
        .quote_style = ini.FmtOptions.QuoteStyle.from_str(transalte.js_str_from_object(env, args[1], "quote_style") catch "hash"),
        .comment_style = ini.FmtOptions.CommentStyle.from_str(transalte.js_str_from_object(env, args[1], "comment_style") catch "double"),
    };

    var parser = ini.Parse.init(c_alloc);
    var printer = ini.Printer.init(c_alloc, fmt_options);
    defer {
        parser.deinit();
        printer.deinit();
    }
    parser.parse(input_str) catch return null;
    printer.stringify(parser.ast) catch return null;
    return transalte.create_string(env, printer.sb.s.items[0..printer.sb.s.items.len :0]) catch null;
}
