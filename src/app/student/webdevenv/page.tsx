'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import React, { useState, useEffect, useRef } from 'react'
import * as esbuild from 'esbuild-wasm'
import { unpkgPathPlugin } from './plugins/unpkgplugin'
import { fetchPlugin } from './plugins/fetchPlugin'
import CodeEditor from './_components/code-editor'
import Preview from './_components/preview'

const Page = () => {
    const ref = useRef<any>()

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
        setCode(result.outputFiles[0].text)
    }

    return (
        <div className="flex flex-col  items-start gap-3 ">
            <CodeEditor
                onChange={(value: string) => setInput(value)}
                initialValue="const a = 1;"
            />
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <div>
                <Button onClick={onClick}>Submit</Button>
            </div>
            <pre className="text-start">{code}</pre>
            <Preview code={code} />
        </div>
    )
}

export default Page
