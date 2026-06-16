'use client'
import * as esbuild from 'esbuild-wasm'
import { useState, useEffect, useRef } from 'react'
import { unpkgPathPlugin } from './_components/plugins/unpkgPathPlugin'
import { fetchPlugin } from './_components/plugins/fetchplugin'

const ReactPlayGround = () => {
    const ref = useRef<any>()
    const iframe = useRef<any>()
    const [input, setInput] = useState('')
    const [code, setCode] = useState('')


    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
        })
    }
    useEffect(() => {
        startService()
    }, [])

    const onClick = async () => {
        if (!ref.current) {
            return
        }

        const result = await ref.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(input)],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window',
            },
        })
        console.log('result', result)
        iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*')
        // setCode(result.outputFiles[0].text)
        // try {
        //   eval(result.outputFiles[0].text);
        // } catch (err) {
        //    console.error(err);
        // }
    }

    const htmlDoc = `
    <html>
     <head></head>
     <body>
       <div id="root"></div>
       <script>
        window.addEventListener('message', (event) => {
            eval(event.data);
          },false);
       </script>
     </body>
    </html>
  `

    return (
        <div>
            <textarea
                value={input}
                className="mt-20 w-full"
                onChange={(e) => setInput(e.target.value)}
            ></textarea>
            <div>
                <button onClick={onClick}>Submit</button>
            </div>
            <iframe className='w-screen h-96' ref={iframe} sandbox="allow-scripts" srcDoc={htmlDoc}  />
        </div>
    )
}

export default ReactPlayGround
