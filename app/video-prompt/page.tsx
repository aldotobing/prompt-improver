'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderFormattedResponse } from '@/lib/text-formatter';
import { VideoPromptForm } from '@/components/VideoPromptForm';
import { validateVideoPrompt, generateVeoPrompt } from '@/lib/videoPromptValidation';
import { defaultTemplates, templateDummyData } from '@/constants/promptTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Clipboard, CheckCircle, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const DEFAULT_VALUES = {
  videoPurpose: '',
  targetAudience: '',
  aspectRatio: '16:9 (Widescreen)',
  frameRate: '30fps (NTSC)',
  subject: '',
  action: '',
  mood: '',
  colorPalette: '',
  cameraShot: '',
  cameraMovement: '',
  videoStyleSelect: '',
  composition: '',
  videoStyleDetail: '',
  lightingDetail: '',
  audioDescription: '',
  additionalDetails: ''
};

export default function VideoPromptGenerator() {
  const [activeTab, setActiveTab] = useState('custom');
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const videoTemplates = defaultTemplates.filter(t => t.id.startsWith('veo-'));

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = defaultTemplates.find(t => t.id === templateId);
    if (template) {
      const templateData = templateDummyData[templateId as keyof typeof templateDummyData] || {};
      
      // Map all template data to form fields with more specific names
      const newValues = {
        ...DEFAULT_VALUES,
        // Basic info
        subject: templateData.subject || '',
        action: templateData.action || '',
        mood: templateData.mood || '',
        colorPalette: templateData.colorPalette || '',
        
        // Camera settings
        cameraShot: templateData.cameraShot || '',
        cameraMovement: templateData.cameraMovement || '',
        
        // Style and lighting
        videoStyleSelect: templateData.videoStyleSelect || '',
        lightingSelect: templateData.lightingSelect || '',
        
        // Detailed descriptions
        composition: templateData.composition || '',
        videoStyleDetail: templateData.videoStyleDetail || templateData.videoStyleSelect || '',
        lightingDetail: templateData.lightingDetail || templateData.lightingSelect || '',
        audioDescription: templateData.audio || '',
        additionalDetails: templateData.additionalDetails || ''
      };
      
      setValues(newValues);
      setActiveTab('custom');
      setShowPreview(false);
      toast.success(`"${template.title}" template loaded`);
      
      // Scroll to the form
      setTimeout(() => {
        document.getElementById('video-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const validation = validateVideoPrompt(values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Object.values(validation.errors).forEach(error => {
        if (error) {
          toast.error(error);
        }
      });
      return;
    }
    
    setErrors({});
    setIsGenerating(true);
    
    try {
      // Create a detailed prompt from all form values
      const promptContext = `You are an expert video prompt engineer. Transform this video description into a highly detailed, production-ready prompt for AI video generation.

## Video Concept
- **Purpose**: ${values.videoPurpose || 'Not specified'}
- **Target Audience**: ${values.targetAudience || 'Not specified'}
- **Subject**: ${values.subject || 'Not specified'}
- **Action**: ${values.action || 'Not specified'}
- **Mood/Atmosphere**: ${values.mood || 'Not specified'}

## Visual Style
- **Color Palette**: ${values.colorPalette || 'Not specified'}
- **Video Style**: ${values.videoStyleSelect || 'Not specified'}
- **Style Details**: ${values.videoStyleDetail || 'Not specified'}

## Technical Specifications
- **Aspect Ratio**: ${values.aspectRatio || 'Not specified'}
- **Frame Rate**: ${values.frameRate || 'Not specified'}
- **Camera Shot**: ${values.cameraShot || 'Not specified'}
- **Camera Movement**: ${values.cameraMovement || 'Not specified'}
- **Composition**: ${values.composition || 'Not specified'}
- **Lighting**: ${values.lightingDetail || 'Not specified'}

## Audio & Additional Details
- **Audio Description**: ${values.audioDescription || 'Not specified'}
- **Additional Notes**: ${values.additionalDetails || 'None'}`;

      // First try Google Gemini
      try {
        const geminiResponse = await fetch(
          process.env.NEXT_PUBLIC_AI_PROXY_ENDPOINT || '',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: `# Video Prompt Generation Task

## Provided Context
${promptContext}

## Your Task
Create a comprehensive, production-ready video prompt that brings the above concept to life. 
Use the following structure and incorporate all provided details from the context.

# [Create a compelling title that captures the essence of: ${values.subject || 'the video'}]

## Video Concept
- **Core Idea**: Synthesize the purpose (${values.videoPurpose || 'N/A'}), subject (${values.subject || 'N/A'}), and action (${values.action || 'N/A'}) into a clear, engaging concept.
- **Target Audience**: ${values.targetAudience ? `Tailor the content for: ${values.targetAudience}` : 'General audience'}
- **Emotional Impact**: Capture the mood of "${values.mood || 'neutral'}" through visual and narrative elements

## Visual Direction
- **Cinematic Style**: ${values.videoStyleSelect ? `Incorporate the style of: ${values.videoStyleSelect}` : 'Use a cinematic approach'}
- **Color Palette**: ${values.colorPalette ? `Utilize these colors: ${values.colorPalette}` : 'Choose appropriate colors'}
- **Visual Elements**: ${values.composition ? `Consider composition: ${values.composition}` : 'Focus on strong visual composition'}

## Shot Composition
- **Camera Shots**: ${values.cameraShot ? `Primary shot type: ${values.cameraShot}` : 'Select appropriate shot types'}
- **Camera Movement**: ${values.cameraMovement ? `Movement style: ${values.cameraMovement}` : 'Use dynamic camera movements'}
- **Framing**: Consider aspect ratio: ${values.aspectRatio || 'standard widescreen'}

## Lighting & Atmosphere
- **Lighting Approach**: ${values.lightingDetail ? `Lighting details: ${values.lightingDetail}` : 'Use appropriate lighting'}
- **Mood Enhancement**: Amplify the "${values.mood || 'neutral'}" mood through lighting and composition
- **Visual Tone**: Match the tone to the purpose: ${values.videoPurpose || 'general video'}

## Audio Direction
- **Sound Design**: ${values.audioDescription ? `Audio elements: ${values.audioDescription}` : 'Enhance with appropriate sound design'}
- **Music Selection**: Choose music that complements the "${values.mood || 'neutral'}" mood
- **Pacing**: Align with frame rate: ${values.frameRate || 'standard'}

## Technical Specifications
- **Aspect Ratio**: ${values.aspectRatio || '16:9 (Widescreen)'}
- **Frame Rate**: ${values.frameRate || 'Standard frame rate'}
- **Visual Quality**: High-definition with attention to ${values.videoStyleSelect || 'cinematic'} details

## Production Notes
- **Key Scenes**: Outline 3-5 key scenes based on the subject and action
- **Transitions**: Suggest transitions that enhance the "${values.mood || 'neutral'}" mood
- **Special Instructions**: ${values.additionalDetails || 'No additional instructions provided'}

GUIDELINES:
• Be specific and detailed in all descriptions 
• DO NOT ADD any explanation
• Use vivid, sensory language to create clear mental images 
• Maintain consistency with all provided specifications
• Focus on visual storytelling elements
• Include relevant technical details for production 
• Keep the tone professional yet engaging 
• Ensure the prompt is ready for immediate use with AI video generation tools`,
              model: 'gemini-2.5-flash'
            }),
          }
        );

        if (!geminiResponse.ok) throw new Error("Gemini API failed, falling back to DeepSeek");
        const geminiData = await geminiResponse.json();
        if (!geminiData?.text) throw new Error("Gemini returned no text, falling back to DeepSeek");
        
        setGeneratedPrompt(geminiData.text);
        setAiModelUsed('Google Gemini');
        setShowPreview(true);
        setIsGenerating(false);
        return;
      } catch (geminiError) {
        console.warn("Gemini API failed, falling back to DeepSeek:", geminiError);
        
        // Fallback to DeepSeek
        try {
          const deepseekResponse = await fetch(
            process.env.NEXT_PUBLIC_CLOUDFLARE_DEEPSEEK_AI_URL || '',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: [
                  {
                    role: 'user',
                    content: `# Video Prompt Generation Task

## Provided Context
${promptContext}

## Your Task
Create a comprehensive, production-ready video prompt that brings the above concept to life. 
Use the following structure and incorporate all provided details from the context.

# [Create a compelling title that captures the essence of: ${values.subject || 'the video'}]

## Video Concept
- **Core Idea**: Synthesize the purpose (${values.videoPurpose || 'N/A'}), subject (${values.subject || 'N/A'}), and action (${values.action || 'N/A'}) into a clear, engaging concept.
- **Target Audience**: ${values.targetAudience ? `Tailor the content for: ${values.targetAudience}` : 'General audience'}
- **Emotional Impact**: Capture the mood of "${values.mood || 'neutral'}" through visual and narrative elements

## Visual Direction
- **Cinematic Style**: ${values.videoStyleSelect ? `Incorporate the style of: ${values.videoStyleSelect}` : 'Use a cinematic approach'}
- **Color Palette**: ${values.colorPalette ? `Utilize these colors: ${values.colorPalette}` : 'Choose appropriate colors'}
- **Visual Elements**: ${values.composition ? `Consider composition: ${values.composition}` : 'Focus on strong visual composition'}

## Shot Composition
- **Camera Shots**: ${values.cameraShot ? `Primary shot type: ${values.cameraShot}` : 'Select appropriate shot types'}
- **Camera Movement**: ${values.cameraMovement ? `Movement style: ${values.cameraMovement}` : 'Use dynamic camera movements'}
- **Framing**: Consider aspect ratio: ${values.aspectRatio || 'standard widescreen'}

## Lighting & Atmosphere
- **Lighting Approach**: ${values.lightingDetail ? `Lighting details: ${values.lightingDetail}` : 'Use appropriate lighting'}
- **Mood Enhancement**: Amplify the "${values.mood || 'neutral'}" mood through lighting and composition
- **Visual Tone**: Match the tone to the purpose: ${values.videoPurpose || 'general video'}

## Audio Direction
- **Sound Design**: ${values.audioDescription ? `Audio elements: ${values.audioDescription}` : 'Enhance with appropriate sound design'}
- **Music Selection**: Choose music that complements the "${values.mood || 'neutral'}" mood
- **Pacing**: Align with frame rate: ${values.frameRate || 'standard'}

## Technical Specifications
- **Aspect Ratio**: ${values.aspectRatio || '16:9 (Widescreen)'}
- **Frame Rate**: ${values.frameRate || 'Standard frame rate'}
- **Visual Quality**: High-definition with attention to ${values.videoStyleSelect || 'cinematic'} details

## Production Notes
- **Key Scenes**: Outline 3-5 key scenes based on the subject and action
- **Transitions**: Suggest transitions that enhance the "${values.mood || 'neutral'}" mood
- **Special Instructions**: ${values.additionalDetails || 'No additional instructions provided'}

GUIDELINES:
• Be specific and detailed in all descriptions 
• DO NOT ADD any explanation
• Use vivid, sensory language to create clear mental images 
• Maintain consistency with all provided specifications
• Focus on visual storytelling elements
• Include relevant technical details for production 
• Keep the tone professional yet engaging 
• Ensure the prompt is ready for immediate use with AI video generation tools`
                  },
                ],
              }),
            }
          );

          if (!deepseekResponse.ok) throw new Error("DeepSeek API failed");
          const deepseekData = await deepseekResponse.json();
          if (!deepseekData?.text) throw new Error("DeepSeek returned no text");
          
          setGeneratedPrompt(deepseekData.text);
          setAiModelUsed('DeepSeek');
          setShowPreview(true);
          setIsGenerating(false);
          return;
        } catch (deepseekError) {
          console.error("DeepSeek API failed:", deepseekError);
          throw new Error("Failed to generate video prompt. Please try again later.");
        }
      }

      // State is already updated in the try-catch blocks above
      // No need for additional state updates here
      
      // Scroll to preview
      setTimeout(() => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      toast.success('Video prompt generated successfully!');
    } catch (error) {
      console.error('Error generating video prompt:', error);
      // Fallback to local generation if API fails
      const template = `Create a video with the following details:
Subject: ${values.subject || 'N/A'}
Action: ${values.action || 'N/A'}
Mood: ${values.mood || 'N/A'}
Color Palette: ${values.colorPalette || 'N/A'}`;
      setGeneratedPrompt(generateVeoPrompt(template, values));
      setAiModelUsed('Local Fallback');
      setShowPreview(true);
      toast.error('Using fallback generation. ' + (error instanceof Error ? error.message : 'Failed to generate video prompt'));
    } finally {
      setIsGenerating(false);
    }
  }, [values]);

  const resetForm = useCallback(() => {
    setValues(DEFAULT_VALUES);
    setGeneratedPrompt('');
    setAiModelUsed('');
    setShowPreview(false);
    toast.info('Form has been reset');
  }, []);

  const handleChange = (newValues: Record<string, string>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Film className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">AI Video Prompt Generator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create professional video prompts with AI. Perfect for content creators, marketers, and filmmakers.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="relative border-b border-border/50">
            <TabsList className="relative flex h-9 w-full max-w-md mx-auto bg-transparent p-0">
              <motion.div 
                className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-200"
                style={{
                  width: '50%',
                }}
                animate={{
                  x: activeTab === 'templates' ? 0 : '100%',
                }}
              />
              <TabsTrigger 
                value="templates" 
                className="relative flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200
                  data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground/70
                  hover:text-foreground/90 px-2 py-1.5"
              >
                <Zap className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Templates</span>
              </TabsTrigger>
              <TabsTrigger 
                value="custom" 
                className="relative flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200
                  data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground/70
                  hover:text-foreground/90 px-2 py-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Custom</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="templates" className="space-y-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key="templates-content"
                initial={{ opacity: 0, x: activeTab === 'templates' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'templates' ? -20 : 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Choose a Template</h2>
                  <p className="text-muted-foreground mb-6">Get started quickly with our professionally designed templates</p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key="templates-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.1, ease: 'easeInOut' }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {videoTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                  >
                    <Card 
                      className="cursor-pointer group hover:border-primary/50 transition-all hover:shadow-lg overflow-hidden h-full"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                  <div className="h-2 bg-gradient-to-r from-primary to-primary/70"></div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {template.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.id.replace('veo-', '')}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Use this template
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <div id="video-form">
              <AnimatePresence mode="wait">
                <motion.div
                  key="custom-content"
                  initial={{ opacity: 0, x: activeTab === 'custom' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'custom' ? -20 : 20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold mb-2">Custom Video Prompt</h2>
                    <p className="text-muted-foreground">Fill in the details to generate a custom video prompt</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key="custom-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: 'easeInOut' }}
                >
                  <div className="bg-background border rounded-xl shadow-sm p-6">
                    <VideoPromptForm 
                      values={values}
                      onChange={setValues}
                      onSubmit={handleSubmit}
                      isSubmitting={isGenerating}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {showPreview && generatedPrompt && (
              <div id="preview-section" className="space-y-4 animate-fade-in">
                <Card className="overflow-hidden border-primary/20">
                  <div className="bg-muted/50 p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm font-mono text-muted-foreground">Your Video Prompt</span>
                    </div>
                    {aiModelUsed && (
                      <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-full border">
                        Generated with: <span className="font-medium text-primary">{aiModelUsed}</span>
                      </div>
                    )}
                    <div className="relative group">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-3 relative overflow-hidden min-w-[80px] transition-all duration-300 font-medium ${
                          isCopied 
                            ? 'text-green-600 dark:text-green-400 bg-green-50/80 dark:bg-green-900/30' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                        }`}
                        onClick={() => {
                          if (!isCopied) {
                            navigator.clipboard.writeText(generatedPrompt);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }
                        }}
                      >
                        <span className={`inline-flex items-center justify-center w-full transition-all duration-300 ${
                          isCopied ? 'opacity-0' : 'opacity-100'
                        }`}>
                          <span className="flex items-center gap-1.5">
                            <Clipboard className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </span>
                        </span>

                        {/* Copied state */}
                        <span className={`inline-flex items-center justify-center w-full transition-all duration-300 absolute left-0 ${
                          isCopied ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-green-600 dark:text-green-400">
                            Copied!
                          </span>
                        </span>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 max-w-none max-h-[400px] overflow-auto">
                      {renderFormattedResponse(generatedPrompt)}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Edit the form above to generate a new prompt
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>AI Video Generator • Create stunning video content with AI assistance</p>
          <p className="mt-2 text-xs opacity-70"> {new Date().getFullYear()} Aldo Tobing. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
