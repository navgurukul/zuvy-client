// import React from 'react'
// import Player from 'lottie-react'
// import animationData from '../../../public/animations/loader.json'

// const LottieLoader = () => {
//     console.log('Consoling, animation loader')
//     return (
//         <div
//             style={{
//                 width: 250,
//                 height: 250,
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//             }}
//         >
//             <Player
//                 autoplay
//                 loop
//                 animationData={animationData}
//                 style={{ width: '100%', height: '100%' }}
//             />
//         </div>
//     )
// }

// export default LottieLoader

import React, { useState, useEffect } from 'react'
import Player from 'lottie-react'
import animationData from '../../../public/animations/loader.json'

const modifyAnimationColors = (
    animationData: any,
    primaryColor: string,
    secondaryColor: string
) => {
    const updatedAnimationData = { ...animationData }

    updatedAnimationData.assets.forEach((asset: any) => {
        if (asset.layers) {
            asset.layers.forEach((layer: any) => {
                if (layer.shapes) {
                    layer.shapes.forEach((shape: any) => {
                        if (shape.it) {
                            shape.it.forEach((item: any) => {
                                if (item.ty === 'fl' || item.ty === 'st') {
                                    const color =
                                        item.ty === 'fl'
                                            ? primaryColor
                                            : secondaryColor

                                    if (item.c && item.c.k) {
                                        item.c.k = [
                                            parseInt(color.slice(1, 3), 16) /
                                                255,
                                            parseInt(color.slice(3, 5), 16) /
                                                255,
                                            parseInt(color.slice(5, 7), 16) /
                                                255,
                                            1,
                                        ]
                                    }
                                }
                            })
                        }
                    })
                }
            })
        }
    })

    return updatedAnimationData
}

const LottieLoader = () => {
    const [modifiedAnimationData, setModifiedAnimationData] =
        useState(animationData)

    useEffect(() => {
        const updatedData = modifyAnimationColors(
            animationData,
            '#518672',
            '#FFC374'
        )
        setModifiedAnimationData(updatedData)
    }, [])

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                margin: '0 auto',
            }}
        >
            <div
                style={{
                    width: 210,
                    height: 210,
                }}
            >
                <Player
                    autoplay
                    loop
                    animationData={modifiedAnimationData}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    )
}

export default LottieLoader

// import React, { useState, useEffect } from 'react'
// import Player from 'lottie-react'
// import animationData from '../../../public/animations/loader.json'

// const modifyAnimationColors = (
//     animationData: any,
//     primaryColor: string,
//     secondaryColor: string
// ) => {
//     // Copy animationData to avoid mutating original object
//     const updatedAnimationData = { ...animationData }

//     // Update the fill and stroke colors in the animation data
//     updatedAnimationData.assets.forEach((asset: any) => {
//         if (asset.layers) {
//             asset.layers.forEach((layer: any) => {
//                 if (layer.shapes) {
//                     layer.shapes.forEach((shape: any) => {
//                         if (shape.it) {
//                             shape.it.forEach((item: any) => {
//                                 if (item.ty === 'fl' || item.ty === 'st') {
//                                     // Change color for fill (fl) or stroke (st)
//                                     const color =
//                                         item.ty === 'fl'
//                                             ? primaryColor
//                                             : secondaryColor
//                                     if (item.c && item.c.k) {
//                                         item.c.k = [
//                                             parseInt(color.slice(1, 3), 16) /
//                                                 255,
//                                             parseInt(color.slice(3, 5), 16) /
//                                                 255,
//                                             parseInt(color.slice(5, 7), 16) /
//                                                 255,
//                                             1,
//                                         ]
//                                     }
//                                 }
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     })

//     return updatedAnimationData
// }

// const LottieLoader = () => {
//     const [modifiedAnimationData, setModifiedAnimationData] =
//         useState(animationData)

//     useEffect(() => {
//         // Apply color modifications
//         const updatedData = modifyAnimationColors(
//             animationData,
//             '#518672',
//             '#FFC374'
//         )
//         console.log('updatedData', updatedData)
//         setModifiedAnimationData(updatedData)
//     }, [])

//     console.log('modifiedAnimationData', modifiedAnimationData)

//     return (
//         <div
//             style={{
//                 width: 150,
//                 height: 150,
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//             }}
//         >
//             <Player
//                 autoplay
//                 loop
//                 animationData={modifiedAnimationData} // Updated animation data with modified colors
//                 style={{ width: '100%', height: '100%' }}
//             />
//         </div>
//     )
// }

// export default LottieLoader

// import React, { useState, useEffect } from 'react'
// import Player from 'lottie-react'
// import animationData from '../../../public/animations/loader.json'

// const modifyAnimationColors = (
//     animationData: any,
//     primaryColor: string,
//     secondaryColor: string
// ) => {
//     // Make a copy of the animation data to modify it
//     const updatedAnimationData = { ...animationData }

//     // Iterate through assets, layers, and shapes
//     updatedAnimationData.assets.forEach((asset: any) => {
//         if (asset.layers) {
//             asset.layers.forEach((layer: any) => {
//                 if (layer.shapes) {
//                     layer.shapes.forEach((shape: any) => {
//                         if (shape.it) {
//                             shape.it.forEach((item: any) => {
//                                 if (item.ty === 'fl' || item.ty === 'st') {
//                                     const color =
//                                         item.ty === 'fl'
//                                             ? primaryColor
//                                             : secondaryColor
//                                     console.log('Modifying color:', color) // Debug log

//                                     // Apply the new color
//                                     if (item.c && item.c.k) {
//                                         item.c.k = [
//                                             parseInt(color.slice(1, 3), 16) /
//                                                 255,
//                                             parseInt(color.slice(3, 5), 16) /
//                                                 255,
//                                             parseInt(color.slice(5, 7), 16) /
//                                                 255,
//                                             1,
//                                         ]
//                                     }
//                                 }
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     })

//     return updatedAnimationData
// }

// const LottieLoader = () => {
//     const [modifiedAnimationData, setModifiedAnimationData] =
//         useState(animationData)

//     useEffect(() => {
//         // Modify the animation with the new colors
//         const updatedData = modifyAnimationColors(
//             animationData,
//             '#518672',
//             '#FFC374'
//         )
//         setModifiedAnimationData(updatedData) // Set the modified animation data
//     }, [])

//     return (
//         <div
//             style={{
//                 width: 150,
//                 height: 150,
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//             }}
//         >
//             <Player
//                 autoplay
//                 loop
//                 animationData={modifiedAnimationData} // Pass the modified animation data
//                 style={{ width: '100%', height: '100%' }}
//             />
//         </div>
//     )
// }

// export default LottieLoader
