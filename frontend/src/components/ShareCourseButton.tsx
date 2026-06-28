import { Copy, Globe2, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { Button } from './ui/button';

export default function ShareCourseButton({ course, onUpdate }) {
  const [saving, setSaving] = useState(false);

  async function toggleSharing() {
    setSaving(true);

    try {
      const { data } = await api.patch(`/courses/${course._id}/sharing`, {
        enabled: !course.isPublic,
      });
      onUpdate({ ...course, ...data });
      toast.success(data.isPublic ? 'Public course link enabled' : 'Public course link disabled');
    } catch {
      toast.error('Could not update sharing');
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/share/${course.shareId}`);
      toast.success('Public link copied');
    } catch {
      toast.error('Could not copy the public link');
    }
  }

  let ShareIcon = Globe2;
  if (saving) ShareIcon = Loader2;
  else if (course.isPublic) ShareIcon = Lock;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={toggleSharing} disabled={saving} variant={course.isPublic ? 'secondary' : 'default'}>
        <ShareIcon className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
        {course.isPublic ? 'Make private' : 'Publish to Community'}
      </Button>
      {course.isPublic && (
        <>
          <Button type="button" onClick={copyLink} variant="secondary" title="Copy Link">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <a
            href={`https://twitter.com/intent/tweet?text=Check out my new AI-generated course: ${encodeURIComponent(course.title)}!&url=${encodeURIComponent(window.location.origin + '/share/' + course.shareId)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary" className="px-3" title="Share on Twitter">
              𝕏
            </Button>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/share/' + course.shareId)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary" className="px-3" title="Share on LinkedIn">
              in
            </Button>
          </a>
        </>
      )}
    </div>
  );
}
