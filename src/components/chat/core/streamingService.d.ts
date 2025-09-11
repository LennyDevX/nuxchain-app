export interface StreamingServiceOptions {
  response: Response;
  dispatch: (action: any) => void;
  isLowPerformance: boolean;
  shouldReduceMotion: boolean;
  onUpdate: (content: string) => void;
  onFinish: () => void;
  onError: (error: Error, onRetry: () => void, messageId: string) => void;
  lastMessage: any;
  setInput?: (input: string) => void;
}

export declare class StreamingService {
  constructor();
  processStream(options: StreamingServiceOptions): Promise<void>;
  cancelAllStreams(): void;
  getActiveStreamCount(): number;
  destroy(): void;
}