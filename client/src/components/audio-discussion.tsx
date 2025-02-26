
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Mic } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';

interface AudioDiscussionProps {
  content: string;
  language: string;
}

export function AudioDiscussion({ content, language }: AudioDiscussionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('audio_segment', (data) => {
        const blob = new Blob([data.audio], { type: 'audio/mp3' });
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
          audioRef.current.play();
        }
      });
    }
  }, [socket]);

  const startDiscussion = async () => {
    setIsPlaying(true);
    socket?.emit('start_discussion', { content, language });
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      socket?.emit('user_question', { audio: event.data, language });
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex gap-4">
        <Button
          onClick={startDiscussion}
          disabled={isPlaying}
          variant="default"
        >
          {isPlaying ? 'Playing Discussion...' : 'Start Discussion'}
        </Button>

        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'destructive' : 'outline'}
        >
          <Mic className="w-4 h-4 mr-2" />
          {isRecording ? 'Stop Recording' : 'Ask Question'}
        </Button>
      </div>

      <motion.div
        className="h-12 bg-secondary rounded-lg overflow-hidden"
        animate={isPlaying ? "playing" : "idle"}
        variants={{
          playing: {
            scale: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: 1 }
          },
          idle: { scale: 1 }
        }}
      />
    </div>
  );
}
