import { RevealWaveImage } from "@/components/ui/reveal-wave-image";

export default function DemoOne() {
  return (
    <div className="w-screen h-svh">
      <RevealWaveImage
        src="https://images.unsplash.com/photo-1761839257469-96c78a7c2dd3?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        waveSpeed={0.2}
        waveFrequency={0.7}
        waveAmplitude={0.5}
        revealRadius={0.5}
        revealSoftness={1}
        pixelSize={2}
        mouseRadius={0.4}
      />
    </div>
  )
}
