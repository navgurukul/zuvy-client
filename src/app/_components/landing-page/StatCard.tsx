import React from 'react'
import { STATS } from '@/utils/constant'
// import { motion } from "framer-motion";

interface Stat {
    title: string
    desc: string
}

function StatCard() {
    return (
        <div className="flex flex-col md:flex-row w-full gap-6 p-6 bg-secondary border border-gray-200 rounded-lg shadow">
            {STATS.map((stat: Stat, index: number) => (
                <React.Fragment key={index}>
                    {index !== 0 && (
                        <div className="md:w-1 w-full h-1 md:h-auto rounded-2xl border bg-gray-50 border-gray-50" />
                    )}
                    {/* <motion.button
            className="px-3 lg:w-1/4"
            whileHover={{
              scale: 1.2,
              transition: { duration: 0.5 },
            }}
            whileTap={{ scale: 0.9 }}
          > */}
                    <div className="text-start p-2 rounded-md text-white">
                        <h5 className="mb-2 text-3xl font-bold tracking-tight">
                            {stat.title}
                        </h5>
                        <p className="font-normal">{stat.desc}</p>
                    </div>
                    {/* </motion.button> */}
                </React.Fragment>
            ))}
        </div>
    )
}

export default StatCard
