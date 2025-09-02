import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { ChatSettings } from "@shared/schema";
import { useState, useEffect } from "react";

interface SettingsPanelProps {
  settings: ChatSettings;
  onChange: (settings: Partial<ChatSettings>) => void;
  isVisible: boolean;
  hasMessages: boolean;
}

export function SettingsPanel({
  settings,
  onChange,
  isVisible,
  hasMessages,
}: SettingsPanelProps) {
  const [showSystemPromptWarning, setShowSystemPromptWarning] = useState(false);
  const [originalSystemPrompt, setOriginalSystemPrompt] = useState(settings.systemPrompt);

  useEffect(() => {
    setOriginalSystemPrompt(settings.systemPrompt);
  }, []);

  const handleSystemPromptChange = (value: string) => {
    onChange({ systemPrompt: value });
    
    if (hasMessages && value !== originalSystemPrompt) {
      setShowSystemPromptWarning(true);
      setTimeout(() => setShowSystemPromptWarning(false), 5000);
    }
  };

  const handleTemperatureChange = (value: number[]) => {
    onChange({ temperature: value[0] });
  };

  return (
    <div 
      className={`bg-card border-b border-border transition-all duration-300 ease-out overflow-hidden ${
        isVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
      data-testid="settings-panel"
    >
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* System Prompt */}
          <div className="col-span-full">
            <Label htmlFor="system-prompt" className="text-sm font-medium">
              System Prompt
            </Label>
            <Textarea
              id="system-prompt"
              rows={3}
              value={settings.systemPrompt}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              placeholder="Eres un asistente que ofrece información certera y no muy extensa sobre los temas consultados."
              className="mt-2 resize-none"
              data-testid="textarea-system-prompt"
            />
          </div>
          
          {/* Temperature */}
          <div>
            <Label htmlFor="temperature" className="text-sm font-medium">
              Temperature: <span className="text-primary" data-testid="text-temperature-value">{settings.temperature}</span>
            </Label>
            <Slider
              id="temperature"
              min={0.0}
              max={1.5}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={handleTemperatureChange}
              className="mt-2"
              data-testid="slider-temperature"
            />
          </div>
          
          {/* Max Tokens */}
          <div>
            <Label htmlFor="max-tokens" className="text-sm font-medium">
              Max Tokens
            </Label>
            <Input
              id="max-tokens"
              type="number"
              value={settings.maxTokens}
              onChange={(e) => onChange({ maxTokens: parseInt(e.target.value) || -1 })}
              placeholder="-1 (no limit)"
              className="mt-2"
              data-testid="input-max-tokens"
            />
          </div>
          
          {/* Model */}
          <div>
            <Label htmlFor="model" className="text-sm font-medium">
              Model
            </Label>
            <Input
              id="model"
              value={settings.model}
              onChange={(e) => onChange({ model: e.target.value })}
              className="mt-2"
              data-testid="input-model"
            />
          </div>
          
          {/* Streaming */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="streaming"
              checked={settings.streaming}
              onCheckedChange={(checked) => onChange({ streaming: !!checked })}
              data-testid="checkbox-streaming"
            />
            <Label htmlFor="streaming" className="text-sm font-medium">
              Enable Streaming
            </Label>
          </div>
        </div>
        
        {/* System Prompt Warning */}
        {showSystemPromptWarning && (
          <Alert className="border-destructive/20 bg-destructive/10" data-testid="alert-system-prompt-warning">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive-foreground">
              Changing the system prompt will affect future responses in this conversation.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
