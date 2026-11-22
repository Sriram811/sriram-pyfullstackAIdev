import { Component } from 'react'

// If the 3D layer fails (no GPU, context lost, bad driver) the site keeps working without it.
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.warn('3D layer disabled:', err) }
  render() { return this.state.failed ? null : this.props.children }
}
