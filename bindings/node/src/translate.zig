const std = @import("std");
const c = @import("c.zig");
const assert = std.debug.assert;

// https://nodejs.org/api/n-api.html#node-api

const TranslationError = error{
    ExceptionThrown,
};

pub fn throw(env: c.napi_env, comptime message: [:0]const u8) TranslationError {
    const result = c.napi_throw_error(env, null, @as([*c]const u8, @ptrCast(message)));
    switch (result) {
        c.napi_ok, c.napi_pending_exception => {},
        else => unreachable,
    }
    return TranslationError.ExceptionThrown;
}

pub fn capture_null(env: c.napi_env) !c.napi_value {
    var result: c.napi_value = undefined;
    if (c.napi_get_null(env, &result) != c.napi_ok) {
        return throw(env, "Failed to capture the value of \"null\".");
    }
    return result;
}

pub fn register_function(
    env: c.napi_env,
    exports: c.napi_value,
    comptime name: [:0]const u8,
    function: *const fn (env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value,
) !void {
    var napi_function: c.napi_value = undefined;
    if (c.napi_create_function(env, null, 0, function, null, &napi_function) != c.napi_ok) {
        return throw(env, "Failed to create function " ++ name ++ "().");
    }
    if (c.napi_set_named_property(
        env,
        exports,
        @as([*c]const u8, @ptrCast(name)),
        napi_function,
    ) != c.napi_ok) {
        return throw(env, "Failed to add " ++ name ++ "() to exports.");
    }
}

pub fn extract_args(env: c.napi_env, info: c.napi_callback_info, comptime args: struct {
    count: usize,
    function: []const u8,
}) ![args.count]c.napi_value {
    var argc = args.count;
    var argv: [args.count]c.napi_value = undefined;
    if (c.napi_get_cb_info(env, info, &argc, &argv, null, null) != c.napi_ok) {
        return throw(
            env,
            std.fmt.comptimePrint("Failed to get args for {s}()\x00", .{args.function}),
        );
    }

    if (argc != args.count) {
        return throw(
            env,
            std.fmt.comptimePrint("Function {s}() requires exactly {} arguments.\x00", .{
                args.function,
                args.count,
            }),
        );
    }

    return argv;
}

pub fn u32_from_object(env: c.napi_env, object: c.napi_value, comptime key: [:0]u8) !u32 {
    var property: c.napi_value = undefined;
    if (c.napi_get_named_property(env, object, key, &property) != c.napi_ok) {
        return throw(env, key ++ " must be defined");
    }
}

pub fn u32_from_value(env: c.napi_env, value: c.napi_value, comptime name: [:0]const u8) !u32 {
    var result: u32 = undefined;
    switch (c.napi_get_value_uint32(env, value, &result)) {
        c.napi_ok => {},
        c.napi_number_expected => return throw(env, name ++ " must be a number"),
        else => unreachable,
    }
    return result;
}

pub fn u16_from_object(env: c.napi_env, object: c.napi_value, comptime key: [:0]const u8) !u16 {
    const result = try u32_from_object(env, object, key);
    if (result > std.math.maxInt(u16)) {
        return throw(env, key ++ " must be a u16.");
    }

    return @as(u16, @intCast(result));
}

pub fn slice_from_value(env: c.napi_env, value: c.napi_value) ![]u8 {
    var is_buffer: bool = undefined;
    assert(c.napi_is_buffer(env, value, &is_buffer) == c.napi_ok);

    if (!is_buffer) return throw(env, " must be a buffer");

    var data: ?*anyopaque = null;
    var data_length: usize = undefined;
    assert(c.napi_get_buffer_info(env, value, &data, &data_length) == c.napi_ok);

    return @as([*]u8, @ptrCast(data.?))[0..data_length];
}

pub fn slice_from_object(
    env: c.napi_env,
    object: c.napi_value,
    comptime key: [:0]const u8,
) ![]u8 {
    var property: c.napi_value = undefined;
    if (c.napi_get_named_property(env, object, key, &property) != c.napi_ok) {
        return throw(env, key ++ " must be defined");
    }
    return slice_from_value(env, property);
}
pub fn create_string(env: c.napi_env, value: [:0]const u8) !c.napi_value {
    if (value.len == 0) {
        return throw(env, "String value cannot be empty");
    }
    var result: c.napi_value = undefined;
    assert(c.napi_create_string_utf8(env, value.ptr, value.len, &result) == c.napi_ok);
    return result;
}
