import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocketProvider, useSocket } from "@/components/providers/socket-provider";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  })),
}));

function TestConsumer() {
  const { isConnected } = useSocket();
  return <div data-testid="status">{isConnected ? "connected" : "disconnected"}</div>;
}

describe("SocketProvider", () => {
  it("renders children", () => {
    render(
      <SocketProvider>
        <div data-testid="child">Hello</div>
      </SocketProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("useSocket returns socket context", () => {
    render(
      <SocketProvider>
        <TestConsumer />
      </SocketProvider>
    );
    expect(screen.getByTestId("status")).toHaveTextContent("disconnected");
  });
});
