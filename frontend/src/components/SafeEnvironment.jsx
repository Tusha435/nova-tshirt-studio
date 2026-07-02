import React, { Component, Suspense } from "react";
import { Environment } from "@react-three/drei";

// drei's <Environment> fetches its HDR from a CDN at runtime. If that request
// fails (offline, blocked CDN), the thrown error would unmount the entire app.
// The scenes carry their own lights, so we degrade to those instead.
class EnvErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SafeEnvironment(props) {
  return (
    <EnvErrorBoundary>
      <Suspense fallback={null}>
        <Environment {...props} />
      </Suspense>
    </EnvErrorBoundary>
  );
}
