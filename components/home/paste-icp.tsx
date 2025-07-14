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
import { PersonBackground } from "./person-background"

const FormSchema = z.object({
  content: z
    .string()
    .min(10, {
      message: "ICP description must be at least 10 characters",
    })
    .max(1000, {
      message: "ICP description must be less than 1000 characters",
    })
    .refine(
      (value) => {
        // Check if the input is not just whitespace or common filler words
        const cleanedValue = value.trim().toLowerCase();
        const commonFillers = ['enter', 'here', 'icp', 'description'];
        return !commonFillers.some(word => cleanedValue === word);
      },
      {
        message: "Please provide a meaningful description of your Ideal Customer Persona",
      }
    ),
})

const stubbed = [
    {
        "distance": 0.9018087,
        "document": "\n                    Professional Role: Angel, a strategic market research analyst, leverages her exceptional communication skills and calm demeanor to bridge data and creativity, fostering a culture of innovation while maintaining harmony within her teams.\n                    Occupation: market research analyst or marketing specialist\n                    Key Skills: Angel's background in arts and humanities, coupled with her curious and open nature, has equipped her with a unique set of skills. She is proficient in qualitative research methods, allowing her to delve into the nuances of consumer behavior and cultural trends. Her strong organizational skills, honed from balancing her flexible and reliable nature, enable her to manage complex projects and teams. Angel's exceptional communication skills, stemming from her moderate talkativeness and strong agreeableness, allow her to effectively convey insights and collaborate with stakeholders. She is also conversant in Spanish, having grown up speaking it at home.\n                    Career Focus: As a market research analyst, Angel aspires to become a strategic advisor, leveraging her insights to drive meaningful change in organizations. She aims to bridge the gap between data and creativity, fostering a culture of innovation and informed decision-making. Despite her ambition, she remains grounded in her values of balance and harmony, ensuring that her career growth does not compromise her personal life or well-being. She also hopes to mentor younger professionals, particularly those from diverse backgrounds, to foster a more inclusive and representative workforce.\n                    Education: bachelors\n                    Marital Status: married present\n                    Bachelors Field: arts humanities \n                    Demographics: 46 year old Female in Los Angeles, CA\n                    ",
        "metadata": {
            "age": 46,
            "bachelors_field": "arts humanities",
            "city": "Los Angeles",
            "education_level": "bachelors",
            "marital_status": "married present",
            "occupation": "market research analyst or marketing specialist",
            "person_uuid": "8ec307fe-c797-4ce2-8973-eb511065c694",
            "persona_type": "professional_persona",
            "sex": "Female",
            "state": "CA",
            "zipcode": "90039"
        }
    },
    {
        "distance": 0.89717615,
        "document": "\n                    Professional Role: A strategic marketing manager, Julieta, known for her meticulous planning and open-minded approach, consistently challenges industry norms while nurturing her ambition to launch a bespoke marketing consultancy.\n                    Occupation: marketing manager\n                    Key Skills: Julieta's organizational skills are honed from years of managing projects and teams. She's proficient in digital marketing strategies, data analysis, and customer relationship management. Her open mind has led her to explore emerging technologies like AI and VR, seeking to stay ahead of marketing trends.\n                    Career Focus: As a marketing manager, Julieta aims to drive innovative campaigns that challenge industry norms. She's committed to her company's success, planning ahead to ensure consistent growth. However, she also aspires to start her own marketing consultancy, allowing her to work independently and tailor strategies to clients' unique needs.\n                    Education: high school\n                    Marital Status: never married\n                    Bachelors Field: No higher education \n                    Demographics: 29 year old Female in Orlando, FL\n                    ",
        "metadata": {
            "age": 29,
            "bachelors_field": "No higher education",
            "city": "Orlando",
            "education_level": "high school",
            "marital_status": "never married",
            "occupation": "marketing manager",
            "person_uuid": "8febc5f5-144c-4afd-81f4-5febcb8e3057",
            "persona_type": "professional_persona",
            "sex": "Female",
            "state": "FL",
            "zipcode": "32803"
        }
    },
    {
        "distance": 0.8943727,
        "document": "\n                    Professional Role: Sulma, a strategic marketing expert, excels in translating complex data into actionable insights, her analytical mind balanced by a creative flair that allows her to craft compelling narratives around consumer behavior trends.\n                    Occupation: market research analyst or marketing specialist\n                    Key Skills: With a strong foundation in market research, Sulma excels in data analysis and consumer behavior trends. She's proficient in SPSS, Tableau, and Google Analytics. Her marketing expertise spans social media, content marketing, and event planning. She's also fluent in Spanish and English.\n                    Career Focus: Sulma aims to lead a marketing campaign for a cause she believes in, leveraging her analytical skills and creative insights to drive impact. She values mentoring younger professionals and hopes to become a respected figure in her field.\n                    Education: high school\n                    Marital Status: divorced\n                    Bachelors Field: No higher education \n                    Demographics: 49 year old Female in Miami, FL\n                    ",
        "metadata": {
            "age": 49,
            "bachelors_field": "No higher education",
            "city": "Miami",
            "education_level": "high school",
            "marital_status": "divorced",
            "occupation": "market research analyst or marketing specialist",
            "person_uuid": "b3034445-4fca-4be3-8ed7-5490ae350fab",
            "persona_type": "professional_persona",
            "sex": "Female",
            "state": "FL",
            "zipcode": "33169"
        }
    },
    {
        "distance": 0.87143934,
        "document": "\n                    Professional Role: A seasoned marketing strategist, Andreina, with a penchant for data-driven insights, navigates evolving markets with a blend of curiosity and practicality, often seen brainstorming at her cluttered desk, surrounded by books and half-empty coffee cups.\n                    Occupation: marketing manager\n                    Key Skills: Andreina's marketing background has equipped her with a strong understanding of market research, consumer behavior, and campaign strategy. She's proficient in data analysis tools and has a solid grasp of digital marketing trends. Her relaxed approach to planning allows her to pivot quickly when needed, while her curiosity drives her to continuously seek new learning opportunities.\n                    Career Focus: Andreina, after decades in marketing, aims to transition into a strategic consulting role, leveraging her extensive experience and network to help businesses navigate evolving markets. She seeks a balance between mentoring younger professionals and continuing to learn from industry veterans, valuing both growth and stability.\n                    Education: some college\n                    Marital Status: never married\n                    Bachelors Field: No higher education \n                    Demographics: 64 year old Female in Wilsonville, AL\n                    ",
        "metadata": {
            "age": 64,
            "bachelors_field": "No higher education",
            "city": "Wilsonville",
            "education_level": "some college",
            "marital_status": "never married",
            "occupation": "marketing manager",
            "person_uuid": "50158493-aeca-484c-bef7-e825a7030296",
            "persona_type": "professional_persona",
            "sex": "Female",
            "state": "AL",
            "zipcode": "35186"
        }
    },
    {
        "distance": 0.8610247,
        "document": "\n                    Professional Role: Melina, the meticulous market research consultant, deftly navigates data landscapes, uncovering hidden trends and insights, and presents her findings with a rare blend of technical acumen and storytelling prowess, her reserved nature making her a steadfast and reliable presence in high-stakes meetings.\n                    Occupation: market research analyst or marketing specialist\n                    Key Skills: Melina, with her curious nature and appreciation for new ideas, has honed her skills in market research and data analysis. She's proficient in SPSS, Python, and Tableau, using them to uncover trends and insights. Her open mindset allows her to adapt to new tools and methodologies quickly. She's also developed strong communication skills, effectively presenting complex data in a digestible format to both technical and non-technical stakeholders.\n                    Career Focus: Melina aims to become a senior market research consultant, using her skills to help businesses make data-driven decisions. She's not one for rapid career advancement at the cost of stability, instead preferring a steady climb up the corporate ladder. She also hopes to mentor younger professionals, sharing her knowledge and experiences to help them grow in their careers. Long-term, she envisions starting her own consultancy, offering personalized market research solutions tailored to small and medium-sized businesses.\n                    Education: some college\n                    Marital Status: married present\n                    Bachelors Field: No higher education \n                    Demographics: 42 year old Female in Salisbury, MD\n                    ",
        "metadata": {
            "age": 42,
            "bachelors_field": "No higher education",
            "city": "Salisbury",
            "education_level": "some college",
            "marital_status": "married present",
            "occupation": "market research analyst or marketing specialist",
            "person_uuid": "f1db0f67-e6ab-4c02-a5a2-c160563313ec",
            "persona_type": "professional_persona",
            "sex": "Female",
            "state": "MD",
            "zipcode": "21801"
        }
    }
]

export interface ICP {
  distance: number;
  document: string;
  metadata: {
      age: number;
      bachelors_field: string;
      city: string;
      education_level: string;
      marital_status: string;
      occupation: string;
      person_uuid: string;
      persona_type: string;
      sex: string;
      state: string;
      zipcode: string;
  };
}

export function PasteICP({ icp, setICP }: { icp: string, setICP: (icp: string) => void }) {
  const [matchingICPs, setMatchingICPs] = useState<ICP[]>(stubbed);
  
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { content } = data;
    setIsLoading(true);

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
      setMatchingICPs(resJson);
      console.log("resJSON", )
      setICP(content);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error pulling ICP:", error)
      setIsLoading(false);
    }
  }
  console.log("matchingICPs", matchingICPs)
  return (
    <div className="flex-row rounded-lg border p-4 bg-white relative overflow-hidden">
      {/* Pattern background */}
      <PersonBackground matchingICPs={matchingICPs} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 z-50">
          <FormField
            control={form.control}
            name="content"
              render={({ field }) => (
                <>
                    <FormLabel>Ideal Customer Persona</FormLabel>
                    <FormItem className="resize-none max-w-screen-md h-64 flex flex-col items-center align-center justify-center">
                    <FormControl>
                        <Input
                        className="w-2/3 mx-auto text-center z-10 bg-white"
                        placeholder={icp ? icp : "Enter Your ICP here."}
                        {...field}
                        />
                    </FormControl>
                    </FormItem>
                </>
              )}
            />
            <div className="flex-row space-x-2">
              {isLoading ? (
                <Button type="submit" className="">
                  Searching<LoadingDots color="white" />
                </Button>
              ) : (
                <Button onClick={() => onSubmit(form.getValues())} className="z-10 position-relative">
                  Search US Census
                </Button>
              )}
            </div>
          </form>
        </Form>
    </div>
  )
}