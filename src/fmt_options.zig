const std = @import("std");

pub const FmtOptions = struct {
    quote_style: QuoteStyle = .double,
    comment_style: CommentStyle = .hash,
    pub const QuoteStyle = enum(u3) {
        single,
        double,
        none,
        pub fn from_str(s: []const u8) QuoteStyle {
            if (std.mem.eql(u8, s, "single")) {
                return .single;
            }
            if (std.mem.eql(u8, s, "double")) {
                return .double;
            }

            if (std.mem.eql(u8, s, "none")) {
                return .none;
            }
            unreachable;
        }
    };
    pub const CommentStyle = enum(u3) {
        semi,
        hash,
        pub fn from_str(s: []const u8) CommentStyle {
            if (std.mem.eql(u8, s, "semi")) {
                return .semi;
            }
            if (std.mem.eql(u8, s, "hash")) {
                return .hash;
            }
            unreachable;
        }
    };
};
