
import React from 'react';
import { Survey } from '@/types/survey';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WelcomePage } from './WelcomePage';
import { ThankYouPage } from './ThankYouPage';

interface PagesTabProps {
  survey: Survey;
  onWelcomeTitleChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
  onWelcomeInstructionsChange: (value: string) => void;
  onWelcomeButtonTextChange: (value: string) => void;
  onThankYouTitleChange: (value: string) => void;
  onThankYouMessageChange: (value: string) => void;
  onThankYouButtonTextChange: (value: string) => void;
  onRedirectUrlChange: (value: string) => void;
}

const PagesTab: React.FC<PagesTabProps> = ({
  survey,
  onWelcomeTitleChange,
  onWelcomeMessageChange,
  onWelcomeInstructionsChange,
  onWelcomeButtonTextChange,
  onThankYouTitleChange,
  onThankYouMessageChange,
  onThankYouButtonTextChange,
  onRedirectUrlChange
}) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="welcome" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="welcome">Welcome Page</TabsTrigger>
          <TabsTrigger value="thankyou">Thank You Page</TabsTrigger>
          <TabsTrigger value="preview">Pages Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="welcome">
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-medium">Welcome Page Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure the welcome page that appears before the survey questions.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcomeTitle">Welcome Title</Label>
                  <Input 
                    id="welcomeTitle"
                    placeholder="Welcome to our survey"
                    value={survey.welcomeTitle || ''}
                    onChange={(e) => onWelcomeTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea 
                    id="welcomeMessage"
                    placeholder="Thank you for taking the time to participate in our survey..."
                    value={survey.welcomeMessage || ''}
                    onChange={(e) => onWelcomeMessageChange(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeInstructions">Instructions</Label>
                  <Input 
                    id="welcomeInstructions"
                    placeholder="Click the button below to begin the survey."
                    value={survey.welcomeInstructions || ''}
                    onChange={(e) => onWelcomeInstructionsChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeButtonText">Button Text</Label>
                  <Input 
                    id="welcomeButtonText"
                    placeholder="Start Survey"
                    value={survey.welcomeButtonText || ''}
                    onChange={(e) => onWelcomeButtonTextChange(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="thankyou">
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-medium">Thank You Page Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure the thank you page that appears after survey submission.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thankYouTitle">Thank You Title</Label>
                  <Input 
                    id="thankYouTitle"
                    placeholder="Thank you for your responses"
                    value={survey.thankYouTitle || ''}
                    onChange={(e) => onThankYouTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thankYouMessage">Thank You Message</Label>
                  <Textarea 
                    id="thankYouMessage"
                    placeholder="Your feedback has been submitted successfully."
                    value={survey.thankYouMessage || ''}
                    onChange={(e) => onThankYouMessageChange(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thankYouButtonText">Button Text</Label>
                  <Input 
                    id="thankYouButtonText"
                    placeholder="Close"
                    value={survey.thankYouButtonText || ''}
                    onChange={(e) => onThankYouButtonTextChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
                  <Input 
                    id="redirectUrl"
                    placeholder="https://example.com/thank-you"
                    value={survey.redirectUrl || ''}
                    onChange={(e) => onRedirectUrlChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If provided, users will be redirected to this URL after submission.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Welcome Page Preview</h3>
            <WelcomePage 
              title={survey.welcomeTitle} 
              message={survey.welcomeMessage}
              instructions={survey.welcomeInstructions}
              buttonText={survey.welcomeButtonText}
              onStart={() => {}}
            />
            
            <h3 className="text-lg font-medium mt-8">Thank You Page Preview</h3>
            <ThankYouPage 
              title={survey.thankYouTitle} 
              message={survey.thankYouMessage}
              buttonText={survey.thankYouButtonText}
              redirectUrl={survey.redirectUrl}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PagesTab;
