import { useState, type FormEvent } from "react";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WHATSAPP_NUMBER = "918830077452";

export function BookCallDialog({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !date || !time || date < today) return;
    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
    const message = `Hi Pooja, I'd like to request a call.\n\nName: ${name.trim()}\nPreferred time: ${formattedDate} at ${time} IST${topic.trim() ? `\nTopic: ${topic.trim()}` : ""}\n\nPlease let me know if that works for you.`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
    toast.success("Request ready in WhatsApp", {
      description:
        "Your call request opened in WhatsApp — press send there and Pooja will confirm by reply.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <CalendarDays size={15} aria-hidden="true" /> Book a call
        </Button>
      </DialogTrigger>
      <DialogContent className="booking-dialog">
        <DialogHeader>
          <DialogTitle className="display case-title">LET'S TALK.</DialogTitle>
          <DialogDescription>
            Suggest a time and send your request to Pooja on WhatsApp. Your call is confirmed only
            when she replies.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={sendRequest} className="booking-form">
          <div className="booking-field">
            <Label htmlFor="call-name">Your name</Label>
            <Input
              id="call-name"
              autoComplete="name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="booking-row">
            <div className="booking-field">
              <Label htmlFor="call-date">Preferred date</Label>
              <Input
                id="call-date"
                type="date"
                min={today}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="booking-field">
              <Label htmlFor="call-time">Time (IST)</Label>
              <Input
                id="call-time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="booking-field">
            <Label htmlFor="call-topic">
              What would you like to discuss? <span className="booking-optional">Optional</span>
            </Label>
            <Textarea
              id="call-topic"
              maxLength={500}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="A little about your project or opportunity"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              Continue to WhatsApp <ArrowUpRight size={15} aria-hidden="true" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
