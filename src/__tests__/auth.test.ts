import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, requireAuth, requireRole } from "@/lib/auth/utils";

describe("hashPassword", () => {
  it("produces a bcrypt hash that verifyPassword validates", async () => {
    const hash = await hashPassword("mypassword");
    expect(hash).not.toBe("mypassword");
    expect(hash.startsWith("$2")).toBe(true);
    const valid = await verifyPassword("mypassword", hash);
    expect(valid).toBe(true);
  });

  it("wrong password fails verifyPassword", async () => {
    const hash = await hashPassword("mypassword");
    const valid = await verifyPassword("wrongpassword", hash);
    expect(valid).toBe(false);
  });
});

describe("JWT callback logic", () => {
  it("adds role and id to token when user object present", async () => {
    // Import config to test callbacks
    const { authConfig } = await import("@/lib/auth/config");
    const jwt = authConfig.callbacks!.jwt!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = await (jwt as any)({
      token: { sub: "123" },
      user: { id: "user-1", role: "educator", email: "test@test.com", name: "Test" },
      account: null,
      trigger: "signIn",
    });
    expect(token.role).toBe("educator");
    expect(token.id).toBe("user-1");
  });
});

describe("Session callback logic", () => {
  it("adds role and id to session.user from token", async () => {
    const { authConfig } = await import("@/lib/auth/config");
    const sessionCb = authConfig.callbacks!.session!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (sessionCb as any)({
      session: { user: { email: "test@test.com", name: "Test" }, expires: "" },
      token: { role: "educator", id: "user-1", sub: "user-1" },
    });
    expect(result.user.role).toBe("educator");
    expect(result.user.id).toBe("user-1");
  });
});

describe("requireAuth", () => {
  it("throws when session is null", () => {
    expect(() => requireAuth(null)).toThrow("Authentication required");
  });

  it("throws when session has no user", () => {
    expect(() => requireAuth({})).toThrow("Authentication required");
  });

  it("passes with valid session", () => {
    const session = { user: { id: "1", role: "learner" } };
    expect(requireAuth(session)).toBe(session);
  });
});

describe("requireRole", () => {
  it("throws for wrong role", () => {
    const session = { user: { id: "1", role: "learner" } };
    expect(() => requireRole(session, "educator")).toThrow("Role 'educator' required");
  });

  it("passes for correct role", () => {
    const session = { user: { id: "1", role: "educator" } };
    expect(requireRole(session, "educator")).toBe(session);
  });

  it("admin passes any role check", () => {
    const session = { user: { id: "1", role: "admin" } };
    expect(requireRole(session, "educator")).toBe(session);
  });
});
