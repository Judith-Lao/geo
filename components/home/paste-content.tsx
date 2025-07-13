"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/components/ui/button"
import { LoadingDots } from "@/components/shared/icons";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/components/ui/form"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/components/ui/sheet"

import { Textarea } from "@/components/components/ui/textarea"
import { useState } from "react"
import { Badge } from "../components/ui/badge"
import { toast } from "sonner"

const FormSchema = z.object({
  content: z
    .string()
    .min(5, {
      message: "Content must be at least 5 characters.",
    })
    .max(15000, {
      message: "Content must not be longer than 15000 characters.",
    }),
})

export function PasteContent({ marketingContent, setMarketingContent }: { marketingContent: string, setMarketingContent: (marketingContent: string) => void }) {
  const [fluency, setFluency] = useState({ score: 0, recommendations: [] });
  const [citations, setCitations] = useState({ score: 0, recommendations: [] });
  const [statistics, setStatistics] = useState({ score: 0, recommendations: [] });
  const [authority, setAuthority] = useState({ score: 0, recommendations: [] });
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { content } = data;
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/assign_fluency_score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const error = await res.json();
        if (error.message?.includes('overloaded_error')) {
          console.error('Anthropic API is currently overloaded. Please try again in a few minutes.');
        } else {
          console.error('Error analyzing content. Please try again.');
        }
        setIsLoading(false);
        return;
      }
      const resJson = await res.json();
      console.log("resJson.text", resJson.text)
      if (typeof resJson.text === 'string') {
        toast(`I noticed you submitted text that doesn't look like marketing content. Please paste in the appropriate content and I'll analyze it according to proven GEO methods.`);
        setIsLoading(false);
        return;
      }
      const { fluency, citations, statistics, authority } = JSON.parse(resJson.text);
      setFluency(fluency);
      setCitations(citations);
      setStatistics(statistics);
      setAuthority(authority);
      setIsLoading(false);
      setMarketingContent(content);
    } catch (error: any) {
      console.error("Error analyzing content:", error)
      setIsLoading(false);
    }
  }
  console.log("marketingContent", marketingContent)
  // async function onSubmit(data: z.infer<typeof FormSchema>) {
  //   const { content } = data;
  //   const streamResponse = await fetch('http://localhost:8000/assign_fluency_score', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ content }),
  //   });
  //   const stream = streamResponse.body;
  //   if (!stream) {
  //     toast.error('Something went wrong');
  //     return;
  //   }
  //   const reader = stream.getReader();
  //   const decoder = new TextDecoder();
  //   let result = '';
  //   while (true) {
  //     const { done, value } = await reader.read();
  //     if (done) break;
  //     result += decoder.decode(value);
  //     setStreamedResult(result);
  //   }
  //   toast.success('Content analyzed successfully');
  //   console.log(result);
  // }

  return (
    <Sheet>
      <div className="flex-row rounded-lg border p-4 bg-white">
        <div className="flex-row space-x-2 justify-self-end">
          {isLoading ? <Badge variant="outline">Fluency <LoadingDots /></Badge> : <Badge variant="outline">Fluency: {fluency.score}</Badge>}
          {isLoading ? <Badge variant="outline">Citations <LoadingDots /></Badge> : <Badge variant="outline">Citations: {citations.score}</Badge>}
          {isLoading ? <Badge variant="outline">Statistics <LoadingDots /></Badge> : <Badge variant="outline">Statistics: {statistics.score}</Badge>}
          {isLoading ? <Badge variant="outline">Authority <LoadingDots /></Badge> : <Badge variant="outline">Authority: {authority.score}</Badge>}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marketing Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={marketingContent ? marketingContent : "Copy and paste a blog post here."}
                      className="resize-none max-w-screen-md h-64"
                      {...field}
                    />
                  </FormControl>
                  {/* <FormDescription>
                You can <span>@mention</span> a url here.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex-row space-x-2">
              {isLoading ? <Button type="submit" className="">Analyzing<LoadingDots color="white" /></Button> : <Button type="submit" className="">Analyze</Button>}
              {fluency.score > 0 && (<SheetTrigger><Button variant="outline" type="button">View Recommendations</Button></SheetTrigger>)}
            </div>
          </form>
        </Form>
        <SheetContent className="max-h-screen overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>Recommendations</SheetTitle>
            <SheetDescription>
              These are our recommendations for improvement based on AI Judge scores.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            {/* Fluency Section */}
            <div className="border-l-4 border-primary/50 pl-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Fluency</h3>
                {
                  fluency.score > 0 && <Badge variant={fluency.score === 5 ? "secondary" : fluency.score >= 3 ? "default" : "destructive"} className="text-sm">
                    {fluency.score}/5
                  </Badge>
                }
              </div>
              <ul className="list-disc list-inside space-y-2">
                {fluency.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Citations Section */}
            <div className="border-l-4 border-primary/50 pl-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Citations</h3>
                {
                  citations.score > 0 && <Badge variant={citations.score === 5 ? "secondary" : citations.score >= 3 ? "default" : "destructive"} className="text-sm">
                    {citations.score}/5
                  </Badge>
                }
              </div>
              <ul className="list-disc list-inside space-y-2">
                {citations.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Statistics Section */}
            <div className="border-l-4 border-primary/50 pl-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Statistics</h3>
                {
                  statistics.score > 0 && <Badge variant={statistics.score === 5 ? "secondary" : statistics.score >= 3 ? "default" : "destructive"} className="text-sm">
                    {statistics.score}/5
                  </Badge>
                }
              </div>
              <ul className="list-disc list-inside space-y-2">
                {statistics.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Authority Section */}
            <div className="border-l-4 border-primary/50 pl-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Authority</h3>
                {
                  authority.score > 0 && <Badge variant={authority.score === 5 ? "secondary" : authority.score >= 3 ? "default" : "destructive"} className="text-sm">
                    {authority.score}/5
                  </Badge>
                }
              </div>
              <ul className="list-disc list-inside space-y-2">
                {authority.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SheetContent>
      </div>
    </Sheet>
  )
}