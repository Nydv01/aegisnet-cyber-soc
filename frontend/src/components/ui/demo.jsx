import { SplineScene } from "./spline";
import { Card } from "./card";
import { Spotlight } from "./spotlight";

export function SplineSceneBasic({ onAction }) {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] border border-cyan-500/20 relative overflow-hidden rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.1)]">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="cyan"
      />
      
      <div className="flex h-full flex-col md:flex-row">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-cyan-400 to-blue-500">
            Interactive 3D Shield
          </h2>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Interact with our neural defense nodes. Rotate, zoom, and explore the cyber security layer mapping live attack mitigations in real time.
          </p>
          <div className="mt-8">
            <button
              onClick={onAction}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Enter Dashboard →
            </button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative w-full h-[300px] md:h-full">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}
