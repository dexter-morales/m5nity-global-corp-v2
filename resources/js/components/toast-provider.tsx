import React from 'react'

export default function ToastProvider() {
  const [Container, setContainer] = React.useState<React.ComponentType<any> | null>(null)

  React.useEffect(() => {
    let mounted = true
    // Dynamically load toast container and its stylesheet (if available)
    Promise.all([
      import('react-toastify').then((m) => m.ToastContainer).catch(() => null),
      // Try to load default styles; ignore if package not present
      import('react-toastify/dist/ReactToastify.css').catch(() => null),
    ]).then(([ToastContainer]) => {
      if (mounted && ToastContainer) setContainer(() => ToastContainer as any)
    })

    return () => {
      mounted = false
    }
  }, [])

  if (!Container) return null
  return (
    <Container position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover />
  )
}

