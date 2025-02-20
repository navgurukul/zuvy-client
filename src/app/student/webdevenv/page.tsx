'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import React, { useState, useEffect, useRef } from 'react'
import * as esbuild from 'esbuild-wasm'
import { unpkgPathPlugin } from './plugins/unpkgplugin'
import { fetchPlugin } from './plugins/fetchPlugin'

const Page = () => {
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

    async function onClick() {
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
        // setCode(result.outputFiles[0].text)
        iframe.current.contentWindow.postMessage(
            result.outputFiles[0].text,
            '*'
        )
    }

    const html = `
    <html>
    <head></head>
     <body>
          <div id="root"></div>
       <script>
          window.addEventListener("message" , (event) => {
            eval(event.data)
          },false)
       </script>
     </body>
    </html>
`
    return (
        <div className="flex flex-col items-start gap-3 ">
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <div>
                <Button onClick={onClick}>Submit</Button>
            </div>
            <pre className="text-start">{code}</pre>
            <iframe ref={iframe} sandbox="allow-scripts" srcDoc={html} />
        </div>
    )
}

export default Page
