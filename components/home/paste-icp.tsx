"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/components/ui/button"
import { LoadingDots } from "@/components/shared/icons";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/components/ui/form"
import { useState } from "react"
import { Input } from "../components/ui/input"

const FormSchema = z.object({
  content: z
    .string()
    .min(5, {
      message: "Content must be at least 5 characters.",
    })
    .max(1000, {
      message: "Content must not be longer than 1000 characters.",
    }),
})

export function PasteICP({ icp, setICP }: { icp: string, setICP: (icp: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { content } = data;
    setIsLoading(true);
    // TODO: implement backend search-ICP route
    try {
      const res = await fetch('http://localhost:8000/search_ICP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const error = await res.json();
        if (error.message?.includes('overloaded_error')) {
          console.error('CHROMA is currently overloaded. Please try again in a few minutes.');
        } else {
          console.error('Error pulling ICP. Please try again.');
        }
        setIsLoading(false);
        return;
      }
      const resJson = await res.json();
      console.log("resJson", resJson)
      setICP(resJson);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error pulling ICP:", error)
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-row rounded-lg border p-4 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <FormField
            control={form.control}
            name="content"
              render={({ field }) => (
                <>
                    <FormLabel>Ideal Customer Persona</FormLabel>
                    <FormItem className="resize-none max-w-screen-md h-64 flex flex-col items-center align-center justify-center">
                    <FormControl>
                        <Input
                        className="w-2/3 mx-auto text-center"
                        placeholder={icp ? icp : "Enter Your ICP here."}
                        {...field}
                        />
                    </FormControl>
                    </FormItem>
                </>
              )}
            />
            <div className="flex-row space-x-2">
              {isLoading ? <Button type="submit" className="">Searching<LoadingDots color="white" /></Button> : <Button type="submit" className="">Search US Census</Button>}
            </div>
          </form>
        </Form>
    </div>
  )
}