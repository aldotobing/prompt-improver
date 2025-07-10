import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, PlayCircle, Download, ChevronDown, ChevronUp, Info, Sparkles, Film, Camera, Sun, Palette, Music, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Script from 'next/script';
import TurnstileWidget from './TurnstileWidget';

interface VideoPromptFormProps {
  template?: any;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onPromptImproved?: (improvedPrompt: string) => void;
}

const VIDEO_PURPOSES = [
  'Product Marketing', 'Brand Awareness', 'Tutorial/How-to', 'Social Media Content',
  'Storytelling', 'Music Video', 'Video Ad', 'Event Coverage', 'Testimonial',
  'Explainer Video', 'Corporate Video', 'Real Estate Showcase', 'Fashion Film',
  'Food & Beverage', 'Travel & Tourism', 'Fitness & Sports', 'Gaming Content',
  'Artistic/Experimental', 'Educational Content', 'News/Journalism'
];

const CAMERA_SHOTS = [
  'Extreme Close-up', 'Close-up', 'Medium Close-up', 'Medium Shot',
  'Medium Full Shot', 'Full Shot', 'Wide Shot', 'Extreme Wide Shot',
  'Over-the-Shoulder', 'Point-of-View', 'Aerial', 'Dutch Angle',
  'Bird\'s Eye', 'Worm\'s Eye', 'Tracking Shot', 'Dolly Zoom',
  'Top Down', 'Low Angle', 'High Angle', '360°', 'Macro', 'Tilt Shift',
  'Split Screen', 'First Person', 'Third Person', 'Drone Shot',
  'Steadicam', 'Handheld', 'Crane Shot', 'Jib Shot', 'Underwater'
];

const CAMERA_MOVEMENTS = [
  'Static', 'Pan', 'Tilt', 'Dolly', 'Truck', 'Pedestal', 'Crane',
  'Steadicam', 'Handheld', 'Zoom', 'Drone', 'Dolly Zoom', 'Arc',
  'Whip Pan', 'Jib', 'Slider', 'Gimbal', 'Snorricam',
  'Vertigo', 'Rolling', 'Handheld Shake', 'Smooth Tracking',
  'Parallax', 'Orbital', 'Jib Up/Down', 'Push In', 'Pull Out',
  'Crash Zoom', 'Whip Zoom', 'Snap Zoom', 'Zolly', 'Rolling Shutter'
];

const ASPECT_RATIOS = [
  '16:9 (Widescreen)', '9:16 (Vertical)', '1:1 (Square)', '4:5 (Portrait)',
  '21:9 (Cinematic)', '4:3 (Standard)', '2.35:1 (Anamorphic)', '3:2 (35mm)'
];

const FRAME_RATES = [
  '24fps (Cinematic)', '25fps (PAL)', '30fps (NTSC)', '48fps (HFR)',
  '50fps (PAL HFR)', '60fps (Slow Motion)', '120fps (Super Slow Motion)'
];

const Section = ({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-muted/50 hover:bg-muted/70 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="p-6 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
};

const FormField = ({ label, name, tooltip, children }: { label: string; name: string; tooltip?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    {children}
  </div>
);

export function VideoPromptForm({
  template,
  values,
  onChange,
  onSubmit,
  isSubmitting,
  onPromptImproved
}: VideoPromptFormProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Reset verification state when form values change
  useEffect(() => {
    setIsVerified(false);
    setTurnstileToken('');
    setShowTurnstile(false);
  }, [values]);

  const handleVerify = (token: string) => {
    setIsVerified(true);
    setTurnstileToken(token);
    // Submit the form directly after verification
    onSubmit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not verified yet, show the Turnstile widget
    if (!isVerified) {
      setShowTurnstile(true);
      return;
    }
  };

  const handleError = () => {
    setIsVerified(false);
    setTurnstileToken('');
    setShowTurnstile(false);
    toast.error('Verification failed. Please try again.');
  };

  const handleExpire = () => {
    setIsVerified(false);
    setTurnstileToken('');
    setShowTurnstile(false);
    toast.error('Verification expired. Please try again.');
  };

  const generateEnhancedPrompt = (formValues: Record<string, string>): string => {
    const {
      videoPurpose,
      targetAudience,
      aspectRatio,
      frameRate,
      subject,
      action,
      mood,
      colorPalette,
      cameraShot,
      cameraMovement,
      videoStyleSelect,
      composition,
      videoStyleDetail,
      lightingDetail,
      additionalDetails,
      audioDescription
    } = formValues;

    // Build the prompt sections
    const sections = [
      `# Video Concept`,
      `**Purpose:** ${videoPurpose || 'Not specified'}`,
      `**Target Audience:** ${targetAudience || 'General audience'}`,
      `\n## Visual Elements`,
      `**Subject:** ${subject || 'Not specified'}`,
      `**Action:** ${action || 'No specific action'}`,
      `**Mood:** ${mood || 'Neutral'}`,
      `**Color Palette:** ${colorPalette || 'Natural colors'}`,
      `\n## Cinematography`,
      `**Camera Shot:** ${cameraShot || 'Standard shot'}`,
      `**Camera Movement:** ${cameraMovement || 'Static'}`,
      `**Composition:** ${composition || 'Standard composition'}`,
      `\n## Style & Aesthetics`,
      `**Video Style:** ${videoStyleSelect || 'Standard'}`,
      `**Style Details:** ${videoStyleDetail || 'No specific style details'}`,
      `**Lighting:** ${lightingDetail || 'Natural lighting'}`,
      `\n## Technical Specifications`,
      `**Aspect Ratio:** ${aspectRatio || '16:9'}`,
      `**Frame Rate:** ${frameRate || 'Standard'}`,
      `\n## Additional Elements`,
      `**Audio Description:** ${audioDescription || 'No specific audio requirements'}`,
      `**Additional Details:** ${additionalDetails || 'None'}`
    ];

    // Add AI enhancement suggestions
    sections.push(
      '\n## AI Enhancement Suggestions',
      '- Consider adding dynamic camera movements to enhance visual interest',
      '- Use lighting to emphasize the mood and atmosphere',
      '- Ensure the color palette supports the intended emotional response',
      '- Consider the rule of thirds and other composition techniques',
      '- Think about how the audio will complement the visual elements'
    );

    return sections.join('\n');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified || !turnstileToken) {
      alert('Please complete the human verification before submitting.');
      return;
    }
    
    // Add the turnstile token to the form values
    const formValues = { ...values, turnstileToken };
    onChange(formValues);
    onSubmit();
  };

  const handleChange = (field: string, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const getFieldValue = (field: string): string => {
    return values[field] || '';
  };

  return (
    <TooltipProvider>
      <form id="video-prompt-form" ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Film className="h-6 w-6 text-primary" />
            Video Generation Assistant
          </h2>
          <p className="text-muted-foreground">
            Create stunning video prompts with AI. Fill in the details below to generate a professional video script.
          </p>
        </div>

        <Section title="Basic Information" icon={Info}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Video Purpose" name="videoPurpose" tooltip="The primary goal of your video">
              <Select
                value={values.videoPurpose || ''}
                onValueChange={(value) => onChange({ ...values, videoPurpose: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a purpose" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Target Audience" name="targetAudience" tooltip="Who is this video for?">
              <Input
                id="targetAudience"
                placeholder="e.g., Young professionals, ages 25-40"
                value={values.targetAudience || ''}
                onChange={(e) => onChange({ ...values, targetAudience: e.target.value })}
              />
            </FormField>

            <FormField label="Aspect Ratio" name="aspectRatio" tooltip="The shape of your video frame">
              <Select
                value={values.aspectRatio || ''}
                onValueChange={(value) => onChange({ ...values, aspectRatio: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((ratio) => (
                    <SelectItem key={ratio} value={ratio}>
                      {ratio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Frame Rate" name="frameRate" tooltip="How many frames per second">
              <Select
                value={values.frameRate || ''}
                onValueChange={(value) => onChange({ ...values, frameRate: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frame rate" />
                </SelectTrigger>
                <SelectContent>
                  {FRAME_RATES.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </Section>

        <Section title="Visual Style" icon={Palette}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Subject" name="subject" tooltip="The main focus of your video">
              <Input
                id="subject"
                placeholder="e.g., A futuristic city skyline"
                value={values.subject || ''}
                onChange={(e) => onChange({ ...values, subject: e.target.value })}
              />
            </FormField>

            <FormField label="Action" name="action" tooltip="What's happening in the scene">
              <Textarea
                id="action"
                placeholder="e.g., flying cars zooming between holographic skyscrapers, people wearing AR glasses"
                value={values.action || ''}
                onChange={(e) => onChange({ ...values, action: e.target.value })}
                rows={3}
              />
            </FormField>

            <FormField label="Mood" name="mood" tooltip="The emotional tone of the video">
              <Input
                id="mood"
                placeholder="e.g., Energetic, Calm, Mysterious"
                value={values.mood || ''}
                onChange={(e) => onChange({ ...values, mood: e.target.value })}
              />
            </FormField>

            <FormField label="Color Palette" name="colorPalette" tooltip="Color scheme for your video">
              <Input
                id="colorPalette"
                placeholder="e.g., Vibrant blues and purples"
                value={values.colorPalette || ''}
                onChange={(e) => onChange({ ...values, colorPalette: e.target.value })}
              />
            </FormField>
          </div>
        </Section>

        <Section title="Camera & Composition" icon={Camera}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Camera Shot Type" name="cameraShot" tooltip="The framing of your shot">
              <Select
                value={values.cameraShot || ''}
                onValueChange={(value) => onChange({ ...values, cameraShot: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shot type" />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_SHOTS.map((shot) => (
                    <SelectItem key={shot} value={shot}>
                      {shot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Camera Movement" name="cameraMovement" tooltip="How the camera moves in the shot">
              <Select
                value={values.cameraMovement || ''}
                onValueChange={(value) => onChange({ ...values, cameraMovement: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select camera movement" />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_MOVEMENTS.map((movement) => (
                    <SelectItem key={movement} value={movement}>
                      {movement}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </Section>

        <Section title="Advanced Settings" icon={Sliders} defaultOpen={false}>
          <div className="space-y-6">
            <FormField label="Composition Details" name="composition" tooltip="Describe the scene composition and visual elements">
              <Textarea
                id="composition"
                placeholder="Describe the scene composition, framing, and visual elements"
                value={values.composition || ''}
                onChange={(e) => onChange({ ...values, composition: e.target.value })}
                rows={3}
              />
            </FormField>

            <FormField label="Style Details" name="videoStyleDetail" tooltip="Additional details about the video style">
              <Textarea
                id="videoStyleDetail"
                placeholder="Additional details about the video style"
                value={values.videoStyleDetail || values.videoStyleSelect || ''}
                onChange={(e) => onChange({ ...values, videoStyleDetail: e.target.value })}
                rows={2}
              />
            </FormField>

            <FormField label="Lighting Details" name="lightingDetail" tooltip="Describe the lighting setup and atmosphere">
              <Textarea
                id="lightingDetail"
                placeholder="Describe the lighting setup and atmosphere"
                value={values.lightingDetail || ''}
                onChange={(e) => onChange({ ...values, lightingDetail: e.target.value })}
                rows={2}
              />
            </FormField>

            <FormField label="Additional Notes" name="additionalDetails" tooltip="Any other important details or requirements">
              <Textarea
                id="additionalDetails"
                placeholder="Any other important details or requirements"
                value={values.additionalDetails || ''}
                onChange={(e) => onChange({ ...values, additionalDetails: e.target.value })}
                rows={3}
              />
            </FormField>
          </div>
        </Section>

        <Section title="Audio & Additional Details" icon={Music}>
          <div className="space-y-6">
            <FormField label="Audio Description" name="audioDescription" tooltip="Music, sound effects, and voiceover details">
              <Textarea
                id="audioDescription"
                placeholder="Describe the audio elements (music, sound effects, voiceover)"
                value={values.audioDescription || ''}
                onChange={(e) => onChange({ ...values, audioDescription: e.target.value })}
                rows={2}
              />
            </FormField>
          </div>
        </Section>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Turnstile Verification */}
              <div className="flex flex-col items-center space-y-2 my-4">
                {showTurnstile && (
                  <div className="w-full max-w-xs mx-auto bg-background p-2 rounded-lg">
                    <div className="mt-2">
                      <div className="text-center mb-3">
                        <p className="text-sm font-medium text-foreground mb-1">Security Check Required</p>
                        <p className="text-xs text-muted-foreground">
                          Complete this quick verification to ensure you're human.
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">
                          This helps prevent automated requests and ensures fair usage for everyone.
                        </p>
                      </div>
                      <div className="flex justify-center">
                      <TurnstileWidget
                        theme="light"
                        onVerify={handleVerify}
                        onError={handleError}
                        onExpire={handleExpire}
                      />
                    </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onChange({
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
                        additionalDetails: '',
                        audioDescription: ''
                      });
                    }}
                    className="h-12 flex-1 border-muted-foreground/30 hover:border-foreground/50 text-muted-foreground hover:text-foreground"
                  >
                    <span className="text-base">Clear Form</span>
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        <span className="text-base">Generate Video Prompt</span>
                      </>
                    )}
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
};

export default VideoPromptForm;
