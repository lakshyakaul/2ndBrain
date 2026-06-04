'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  CreditCard,
  ExternalLink,
  LogOut,
  Pencil,
  User as UserIcon,
  X,
  Check,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ProfileIcon from '../icons/profileIcon';
import LogoutButton from '@/components/app-navbar/profile/logout-button';
import Link from 'next/link';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { postData } from '@/lib/utils';

// ─── Crop Dialog ────────────────────────────────────────────────────────────
interface CropDialogProps {
  src: string;
  onSave: (blob: Blob) => void;
  onClose: () => void;
}

const CropDialog: React.FC<CropDialogProps> = ({ src, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Circle crop state: center & radius in image-space pixels
  const [cropCircle, setCropCircle] = useState({ cx: 0, cy: 0, r: 0 });
  const dragging = useRef<{ startX: number; startY: number; origCx: number; origCy: number } | null>(null);
  const resizing = useRef(false);
  const [loaded, setLoaded] = useState(false);

  // Load image and initialize crop circle
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      const minDim = Math.min(img.width, img.height);
      setCropCircle({ cx: img.width / 2, cy: img.height / 2, r: minDim / 2 * 0.8 });
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  // Draw canvas whenever crop changes
  useEffect(() => {
    if (!loaded || !imgRef.current || !canvasRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;

    // Scale to fit container (max 400px)
    const maxW = 400;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Darken outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut out circle
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cropCircle.cx * scale, cropCircle.cy * scale, cropCircle.r * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Redraw image inside circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cropCircle.cx * scale, cropCircle.cy * scale, cropCircle.r * scale, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Circle border
    ctx.beginPath();
    ctx.arc(cropCircle.cx * scale, cropCircle.cy * scale, cropCircle.r * scale, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [cropCircle, loaded]);

  const getScale = () => {
    if (!imgRef.current || !canvasRef.current) return 1;
    return canvasRef.current.width / imgRef.current.width;
  };

  const toImgCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = getScale();
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const { x, y } = toImgCoords(e.clientX, e.clientY);
    const dx = x - cropCircle.cx;
    const dy = y - cropCircle.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(dist - cropCircle.r) < 10 / getScale()) {
      resizing.current = true;
    } else if (dist < cropCircle.r) {
      dragging.current = { startX: x, startY: y, origCx: cropCircle.cx, origCy: cropCircle.cy };
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const { x, y } = toImgCoords(e.clientX, e.clientY);
    if (resizing.current) {
      const dx = x - cropCircle.cx;
      const dy = y - cropCircle.cy;
      const newR = Math.max(20, Math.sqrt(dx * dx + dy * dy));
      const maxR = Math.min(
        cropCircle.cx, cropCircle.cy,
        imgRef.current.width - cropCircle.cx,
        imgRef.current.height - cropCircle.cy,
        newR
      );
      setCropCircle(c => ({ ...c, r: maxR }));
    } else if (dragging.current) {
      const dx = x - dragging.current.startX;
      const dy = y - dragging.current.startY;
      const img = imgRef.current;
      const newCx = Math.max(cropCircle.r, Math.min(img.width - cropCircle.r, dragging.current.origCx + dx));
      const newCy = Math.max(cropCircle.r, Math.min(img.height - cropCircle.r, dragging.current.origCy + dy));
      setCropCircle(c => ({ ...c, cx: newCx, cy: newCy }));
    }
  };

  const onMouseUp = () => {
    dragging.current = null;
    resizing.current = false;
  };

  const handleSave = () => {
    if (!imgRef.current) return;
    const size = 256;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext('2d')!;
    // Clip to circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    // Draw cropped portion
    const img = imgRef.current;
    ctx.drawImage(
      img,
      cropCircle.cx - cropCircle.r,
      cropCircle.cy - cropCircle.r,
      cropCircle.r * 2,
      cropCircle.r * 2,
      0, 0, size, size
    );
    offscreen.toBlob(blob => {
      if (blob) onSave(blob);
    }, 'image/webp', 0.92);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-w-[480px] w-full mx-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Crop Profile Picture</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Drag the circle to reposition. Drag the edge to resize.</p>
        <div
          ref={containerRef}
          className="flex items-center justify-center overflow-hidden rounded-xl cursor-move"
          style={{ userSelect: 'none' }}
        >
          <canvas
            ref={canvasRef}
            className="rounded-xl"
            style={{ cursor: 'move', touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Check size={14} /> Save Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const UserSettingsForm = () => {
  const { user, subscription } = useSupabaseUser();
  const { open, setOpen } = useSubscriptionModal();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nicknameTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!user?.id) return;
    const fetchUser = async () => {
      const { data } = await supabase.from('users').select('nickname, avatar_url').eq('id', user.id).single();
      if (data?.nickname) setNickname(data.nickname);
      if (data?.avatar_url) {
        setAvatarUrl(
          supabase.storage.from('avatars').getPublicUrl(data.avatar_url).data.publicUrl
        );
      }
    };
    fetchUser();
  }, [user]);

  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await postData({ url: '/api/create-portal-link' });
      window.location.assign(url);
    } catch {
      setLoadingPortal(false);
    }
    setLoadingPortal(false);
  };

  const nicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value.slice(0, 10);
    setNickname(newNickname);
    if (nicknameTimerRef.current) clearTimeout(nicknameTimerRef.current);
    nicknameTimerRef.current = setTimeout(async () => {
      if (!user?.id) return;
      await supabase.from('users').update({ nickname: newNickname }).eq('id', user.id);
      toast.success('Nickname updated');
      router.refresh();
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10 MB limit');
      e.target.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    setCropSrc(url);
    // Reset so the same file can be selected again
    e.target.value = '';
  };

  const handleCropSave = useCallback(async (blob: Blob) => {
    setCropSrc(null);
    if (!user?.id) return;
    setUploadingProfilePic(true);
    try {
      const filePath = `${user.id}/avatar.webp`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { contentType: 'image/webp', upsert: true });
      if (uploadError) throw uploadError;

      await supabase.from('users').update({ avatar_url: filePath }).eq('id', user.id);

      const publicUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
      toast.success('Profile picture updated');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to upload: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploadingProfilePic(false);
    }
  }, [user, supabase, router]);

  return (
    <>
      {cropSrc && (
        <CropDialog
          src={cropSrc}
          onSave={handleCropSave}
          onClose={() => setCropSrc(null)}
        />
      )}

      <div className="flex flex-col gap-6 py-4">
        {/* Profile Details Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
              <UserIcon size={20} /> Profile Details
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Update your personal information and how others see you.
            </p>
          </div>
          <Separator />
          <div className="p-6 space-y-6">
            {/* Avatar with hover pencil */}
            <div className="flex items-center gap-6">
              <div className="relative group shrink-0">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    <ProfileIcon />
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingProfilePic}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Change profile picture"
                >
                  {uploadingProfilePic ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Pencil size={16} className="text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">Nickname <span className="text-muted-foreground font-normal">(Max 10 chars)</span></Label>
                  <Input
                    name="nickname"
                    value={nickname}
                    placeholder="Nickname"
                    onChange={nicknameChange}
                    className="max-w-[240px]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Email</Label>
                  <small className="text-muted-foreground cursor-not-allowed bg-muted/50 px-3 py-1.5 rounded-md border inline-flex items-center w-max text-xs">
                    {user?.email}
                  </small>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <small className="font-mono text-[11px] text-muted-foreground/70 cursor-not-allowed bg-muted/30 px-3 py-1.5 rounded-md border inline-flex items-center w-max max-w-[260px] truncate">
                    {user?.id}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
              <CreditCard size={20} /> Subscription
            </h3>
            <p className="text-sm text-muted-foreground mt-2">Manage your billing and plan details.</p>
          </div>
          <Separator />
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Current Plan</span>
              <p className="text-muted-foreground text-sm">
                You are currently on the{' '}
                <span className="inline-flex items-center rounded-full border px-2.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 whitespace-nowrap align-middle">
                  {subscription?.status === 'active' ? 'Pro' : 'Free'} Plan
                </span>
              </p>
              <Link href="/" target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                View pricing plans <ExternalLink size={14} />
              </Link>
            </div>
            <div className="shrink-0 mt-2 sm:mt-0">
              {subscription?.status === 'active' ? (
                <Button type="button" variant="outline" disabled={loadingPortal} onClick={redirectToCustomerPortal}>
                  Manage Subscription
                </Button>
              ) : (
                <Button type="button" onClick={() => setOpen(true)}>Start Pro Plan</Button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold leading-none tracking-tight text-lg text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mt-2">Sign out of your account on this device.</p>
            </div>
            <div className="shrink-0 mt-2 sm:mt-0">
              <LogoutButton>
                <Button variant="destructive" className="flex items-center gap-2">
                  <LogOut size={16} /> Sign Out
                </Button>
              </LogoutButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSettingsForm;
