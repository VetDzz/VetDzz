"use client"

import { PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function PulsingCircle() {
  return (
    <div className="absolute bottom-8 right-8 z-30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Pulsing Border Circle */}
        <PulsingBorder
          colors={["#22c55e", "#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0", "#047857"]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          spotsPerColor={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src="/images/vetdz-logo.jpeg"
              alt="VetDz Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-sm fill-white/80 instrument">
            <textPath href="#circle" startOffset="0%">
              VetDz • Your Pet Care Partner • VetDz • Your Pet Care Partner •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}
