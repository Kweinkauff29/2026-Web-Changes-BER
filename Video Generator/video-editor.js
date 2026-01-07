// ========================================
// BER Video Editor - Enhanced Engine
// ========================================

// State
const state = {
    format: 'vertical',
    zoom: 1,
    currentTime: 0,
    duration: 90,
    isPlaying: false,
    selectedClip: null,
    clips: [],
    nextClipId: 1,
    previewScale: 1,
    timelineHeight: 220,
    basePreviewSize: { vertical: { w: 270, h: 480 }, horizontal: { w: 540, h: 304 } },
    // Dynamic tracks - type determines render order
    tracks: [
        { id: 'video1', name: 'BG Video', type: 'video', order: 0 },
        { id: 'video2', name: 'Overlay Vid', type: 'video', order: 1 },
        { id: 'text1', name: 'Text 1', type: 'overlay', order: 2 },
        { id: 'text2', name: 'Text 2', type: 'overlay', order: 3 },
        { id: 'captions', name: 'Captions', type: 'caption', order: 4 },
        { id: 'voiceover', name: 'Voiceover', type: 'audio', order: 5 },
        { id: 'audio1', name: 'Audio 1', type: 'audio', order: 6 },
        { id: 'effects', name: 'FX', type: 'effects', order: 7 }
    ],
    nextTrackId: 3,
    // Caption system
    captionAudio: null,
    captionWords: []
};

let canvas, ctx;
let animationFrame = null;
let isDraggingTimeline = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('previewCanvas');
    ctx = canvas.getContext('2d');
    loadFromStorage();
    setFormat(state.format);
    renderTracks();
    renderTimeline();
    renderRuler();
    setupResizer();
    setupCanvasInteraction();
    restoreLayout();
    requestAnimationFrame(renderLoop);
});

// ========================================
// TIMELINE RESIZER
// ========================================
function setupResizer() {
    const resizer = document.getElementById('resizerH');
    const timeline = document.getElementById('timelineContainer');
    const editor = document.getElementById('editorArea');
    let startY, startHeight;

    resizer.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = timeline.offsetHeight;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        const delta = startY - e.clientY;
        const newHeight = Math.max(120, Math.min(400, startHeight + delta));
        timeline.style.height = newHeight + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        state.timelineHeight = timeline.offsetHeight;
        saveLayout();
    }
}

// ========================================
// LAYOUT PERSISTENCE
// ========================================
function saveLayout() {
    const layout = {
        timelineHeight: state.timelineHeight,
        previewScale: state.previewScale
    };
    localStorage.setItem('berVideoEditorLayout', JSON.stringify(layout));
}

function restoreLayout() {
    const saved = localStorage.getItem('berVideoEditorLayout');
    if (!saved) return;

    try {
        const layout = JSON.parse(saved);
        if (layout.timelineHeight) {
            state.timelineHeight = layout.timelineHeight;
            document.getElementById('timelineContainer').style.height = layout.timelineHeight + 'px';
        }
        if (layout.previewScale) {
            state.previewScale = layout.previewScale;
            document.getElementById('previewSizeSlider').value = layout.previewScale * 100;
            document.getElementById('previewSizeLabel').textContent = Math.round(layout.previewScale * 100) + '%';
            updatePreviewContainerSize();
        }
    } catch (e) {
        console.error('Failed to restore layout:', e);
    }
}

// ========================================
// PREVIEW SIZE CONTROL
// ========================================
function setPreviewSize(value) {
    state.previewScale = value / 100;
    document.getElementById('previewSizeLabel').textContent = value + '%';
    updatePreviewContainerSize();
    saveLayout();
}

function updatePreviewContainerSize() {
    const container = document.getElementById('previewContainer');
    const base = state.basePreviewSize[state.format];
    container.style.width = (base.w * state.previewScale) + 'px';
    container.style.height = (base.h * state.previewScale) + 'px';
}

// ========================================
// FORMAT SWITCHING
// ========================================
function setFormat(format) {
    state.format = format;
    const container = document.getElementById('previewContainer');

    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === format);
    });

    container.classList.remove('vertical', 'horizontal');
    container.classList.add(format);

    if (format === 'vertical') {
        canvas.width = 1080;
        canvas.height = 1920;
    } else {
        canvas.width = 1920;
        canvas.height = 1080;
    }

    updatePreviewContainerSize();
    renderPreview();
}

// ========================================
// DURATION CONTROL
// ========================================
function setDuration(value) {
    state.duration = Math.max(10, Math.min(300, parseInt(value) || 90));
    document.getElementById('durationInput').value = state.duration;
    renderTimeline();
    renderRuler();
    updateTimeDisplay();
    saveToStorage();
}

// ========================================
// VISUAL PLAN PARSER
// ========================================
function openVisualPlanModal() {
    document.getElementById('visualPlanModal').classList.add('active');
}

function closeVisualPlanModal() {
    document.getElementById('visualPlanModal').classList.remove('active');
}

function parseVisualPlan() {
    const input = document.getElementById('visualPlanInput').value;
    if (!input.trim()) return;

    // Split into segments by timestamp pattern
    const segmentRegex = /(\d+):(\d+)[–-](\d+):(\d+)\s*[–—-]\s*(.+?)(?=\n\d+:\d+|$)/gs;
    const segments = [];
    let match;

    while ((match = segmentRegex.exec(input)) !== null) {
        const startMin = parseInt(match[1]);
        const startSec = parseInt(match[2]);
        const endMin = parseInt(match[3]);
        const endSec = parseInt(match[4]);
        const label = match[5].trim();

        // Get the full content for this segment
        const nextMatch = segmentRegex.exec(input);
        const endIdx = nextMatch ? nextMatch.index : input.length;
        segmentRegex.lastIndex = match.index + match[0].length; // Reset to continue
        const content = input.slice(match.index, endIdx);

        segments.push({
            startTime: startMin * 60 + startSec,
            endTime: endMin * 60 + endSec,
            label,
            content
        });
    }

    // Re-run to get all segments properly
    segmentRegex.lastIndex = 0;
    segments.length = 0;

    // Split by lines that start with timestamps
    const lines = input.split('\n');
    let currentSegment = null;

    for (const line of lines) {
        const timeMatch = line.match(/^(\d+):(\d+)[–-](\d+):(\d+)\s*[–—-]\s*(.+)/);
        if (timeMatch) {
            if (currentSegment) segments.push(currentSegment);
            currentSegment = {
                startTime: parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]),
                endTime: parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]),
                label: timeMatch[5].trim(),
                content: line + '\n'
            };
        } else if (currentSegment) {
            currentSegment.content += line + '\n';
        }
    }
    if (currentSegment) segments.push(currentSegment);

    state.clips = [];
    let textTrackIndex = 0;

    segments.forEach((seg) => {
        // Parse Background
        const bgMatch = seg.content.match(/Background\s*\(([^)]+)\):\s*(.+)/i);
        const bgType = bgMatch ? bgMatch[1].toLowerCase() : 'placeholder';
        const bgDesc = bgMatch ? bgMatch[2].trim() : seg.label;

        // Create background video clip
        state.clips.push({
            id: state.nextClipId++,
            type: 'video',
            track: 'video1',
            startTime: seg.startTime,
            endTime: seg.endTime,
            label: seg.label,
            description: bgDesc,
            bgType: bgType.includes('sora') ? 'sora' : (bgType.includes('screen') ? 'screenRecording' : 'placeholder'),
            videoSrc: null,
            needsVideo: true
        });

        // Parse Foreground
        const fgMatch = seg.content.match(/Foreground:\s*(.+)/i);
        if (fgMatch && !fgMatch[1].toLowerCase().includes('none')) {
            const fgText = fgMatch[1].toLowerCase();
            let transType = 'flare'; // default for generic foreground
            if (fgText.includes('outline') || fgText.includes('box')) transType = 'ghost';
            else if (fgText.includes('highlight')) transType = 'bloom';

            state.clips.push({
                id: state.nextClipId++,
                type: 'effect',
                track: 'effects',
                startTime: seg.startTime,
                endTime: seg.endTime,
                label: 'FG: ' + fgMatch[1].slice(0, 20),
                transitionType: transType,
                description: fgMatch[1].trim()
            });
        }

        // Parse all Overlays
        const overlayRegex = /Overlay\s*\(([^)]+)\):\s*[""]?([^""\n]+)[""]?/gi;
        let overlayMatch;
        let overlayIdx = 0;

        while ((overlayMatch = overlayRegex.exec(seg.content)) !== null) {
            const style = overlayMatch[1].trim().toLowerCase();
            const text = overlayMatch[2].trim().replace(/[""\u201C\u201D]/g, '');

            // Parse position from style
            let posX = 50, posY = 50;
            if (style.includes('top-left') || style.includes('top left')) { posX = 15; posY = 15; }
            else if (style.includes('top-right')) { posX = 85; posY = 15; }
            else if (style.includes('center-left')) { posX = 15; posY = 50; }
            else if (style.includes('bottom')) { posX = 50; posY = 85; }
            else if (style.includes('top')) { posY = 20; }

            // Parse size
            const isBig = style.includes('big');
            const isTiny = style.includes('tiny');
            const isSmall = style.includes('small') || style.includes('smaller');

            // Determine track
            const trackId = overlayIdx < 2 ? `text${overlayIdx + 1}` : `text${(overlayIdx % 2) + 1}`;

            state.clips.push({
                id: state.nextClipId++,
                type: 'overlay',
                track: trackId,
                startTime: seg.startTime,
                endTime: seg.endTime,
                text: text,
                style: isBig ? 'big' : (isTiny ? 'tiny' : 'small'),
                posX: posX,
                posY: posY,
                fontSize: isBig ? 72 : (isTiny ? 24 : (isSmall ? 32 : 48)),
                color: '#ffffff',
                animation: 'fadeIn',
                textStyle: isBig ? 'label-brand' : (isSmall ? 'label-black' : 'none')
            });
            overlayIdx++;
        }

        // Parse Animation (media and text)
        const animMatch = seg.content.match(/Animation:\s*(.+?)(?=\n[A-Z]|$)/is);
        if (animMatch) {
            const animText = animMatch[1].toLowerCase();

            // Video Entry/Motion
            const videoClip = state.clips.find(c => c.type === 'video' && c.startTime === seg.startTime);
            if (videoClip) {
                if (animText.includes('pop')) videoClip.inAnimation = 'pop';
                else if (animText.includes('fade')) videoClip.inAnimation = 'fadeIn';
                else if (animText.includes('slide up')) videoClip.inAnimation = 'slideUp';
                else if (animText.includes('slide down')) videoClip.inAnimation = 'slideDown';

                if (animText.includes('slow zoom')) videoClip.motion = 'slowZoom';
                else if (animText.includes('zoom out')) videoClip.motion = 'slowZoomOut';
                else if (animText.includes('pan left')) videoClip.motion = 'panLeft';
                else if (animText.includes('pan right')) videoClip.motion = 'panRight';
                else if (animText.includes('breathe')) videoClip.motion = 'breathe';
            }

            // Text Overlays for this segment
            const segOverlays = state.clips.filter(c => c.type === 'overlay' && c.startTime === seg.startTime);
            segOverlays.forEach((ov, idx) => {
                const parts = animText.split(/[.;]/);
                let targetPart = animText;

                // Try to find matching part for this specific overlay (e.g. "Subline =", "BIG text")
                if (idx === 0) targetPart = parts.find(p => p.includes('big') || p.includes('text animation')) || parts[0];
                else if (idx === 1) targetPart = parts.find(p => p.includes('subline') || p.includes('smaller')) || parts[1] || parts[0];

                if (targetPart.includes('pop')) ov.animation = 'zoom';
                else if (targetPart.includes('glow')) ov.animation = 'glow';
                else if (targetPart.includes('slam')) ov.animation = 'slam';
                else if (targetPart.includes('slide down')) ov.animation = 'slideDown';
                else if (targetPart.includes('slide up')) ov.animation = 'slideUp';
                else if (targetPart.includes('draw')) ov.animation = 'drawOn';
                else if (targetPart.includes('typewriter')) ov.animation = 'typewriter';
                else if (targetPart.includes('shake')) ov.animation = 'shake';
                else if (targetPart.includes('stomp')) ov.animation = 'stomp';
                else if (targetPart.includes('bounce')) ov.animation = 'bounce';
            });
        }

        // Parse Transition
        const transMatch = seg.content.match(/Transition(?:\s+(?:in|out))?:\s*(.+?)(?=\n|$)/i);
        if (transMatch) {
            const transText = transMatch[1].toLowerCase();
            let transType = 'cut';
            if (transText.includes('fade')) transType = 'fade';
            else if (transText.includes('whip') || transText.includes('whip pan')) transType = 'whipPan';
            else if (transText.includes('wipe left')) transType = 'wipeLeft';
            else if (transText.includes('wipe up')) transType = 'wipeUp';
            else if (transText.includes('glitch')) transType = 'glitchHeavy';
            else if (transText.includes('bloom')) transType = 'bloom';
            else if (transText.includes('zoom cloud')) transType = 'zoomCloud';
            else if (transText.includes('flare')) transType = 'flare';
            else if (transText.includes('ghost')) transType = 'ghost';
            else if (transText.includes('warp')) transType = 'warp';
            else if (transText.includes('swipe')) transType = 'wipeLeft';

            if (transType !== 'cut' && !transText.includes('hard')) {
                state.clips.push({
                    id: state.nextClipId++,
                    type: 'effect',
                    track: 'effects',
                    startTime: seg.startTime,
                    endTime: seg.startTime + 0.3,
                    label: 'Trans: ' + transType,
                    transitionType: transType,
                    description: transMatch[1].trim()
                });
            }
        }

        // Parse Sora prompt (store for reference)
        const soraMatch = seg.content.match(/Sora prompt[^:]*:\s*[""]?([^""\n]+)[""]?/i);
        if (soraMatch) {
            // Tag the video clip with the Sora prompt
            const videoClip = state.clips.find(c => c.type === 'video' && c.startTime === seg.startTime);
            if (videoClip) {
                videoClip.soraPrompt = soraMatch[1].trim();
            }
        }
    });

    if (segments.length > 0) {
        state.duration = Math.max(...segments.map(s => s.endTime));
        document.getElementById('durationInput').value = state.duration;
    }

    closeVisualPlanModal();
    renderTracks();
    renderTimeline();
    renderRuler();
    updateTimeDisplay();
    saveToStorage();

    console.log(`Parsed ${segments.length} segments, created ${state.clips.length} clips`);
}

function parsePosition(styleStr) {
    const lower = styleStr.toLowerCase();
    if (lower.includes('top-left')) return 'topLeft';
    if (lower.includes('top-right')) return 'topRight';
    if (lower.includes('center-left')) return 'centerLeft';
    if (lower.includes('top')) return 'top';
    if (lower.includes('bottom')) return 'bottom';
    return 'center';
}

// ========================================
// DYNAMIC TRACK RENDERING
// ========================================
function renderTracks() {
    const container = document.getElementById('timelineTracks');
    const playhead = document.getElementById('playhead');

    // Clear existing tracks but keep playhead
    container.innerHTML = '';

    // Sort tracks by order
    const sortedTracks = [...state.tracks].sort((a, b) => a.order - b.order);

    // Create track elements
    sortedTracks.forEach(track => {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track';
        trackDiv.dataset.trackId = track.id;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'track-label';

        // Color based on track type
        const colors = {
            video: 'var(--track-video)',
            overlay: 'var(--track-overlay)',
            audio: 'var(--track-audio)',
            effects: 'var(--track-effects)',
            caption: '#FFE135' // TikTok yellow for captions
        };

        labelDiv.innerHTML = `
            <span class="dot" style="background: ${colors[track.type] || '#666'};"></span>
            <span class="track-name">${track.name}</span>
            <div class="track-controls">
                <button class="track-btn" onclick="moveTrackUp('${track.id}')" title="Move Up">▲</button>
                <button class="track-btn" onclick="moveTrackDown('${track.id}')" title="Move Down">▼</button>
            </div>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'track-content';
        contentDiv.id = 'track_' + track.id;

        trackDiv.appendChild(labelDiv);
        trackDiv.appendChild(contentDiv);
        container.appendChild(trackDiv);
    });

    // Re-add playhead
    container.appendChild(playhead);
}

function addVideoTrack() {
    const id = 'video' + state.nextTrackId++;
    state.tracks.push({ id, name: 'Video ' + (state.tracks.filter(t => t.type === 'video').length + 1), type: 'video', order: state.tracks.length });
    renderTracks();
    renderTimeline();
    saveToStorage();
}

function addTextTrack() {
    const id = 'text' + state.nextTrackId++;
    state.tracks.push({ id, name: 'Text ' + (state.tracks.filter(t => t.type === 'overlay').length + 1), type: 'overlay', order: state.tracks.length });
    renderTracks();
    renderTimeline();
    saveToStorage();
}

function addAudioTrack() {
    const id = 'audio' + state.nextTrackId++;
    state.tracks.push({ id, name: 'Audio ' + (state.tracks.filter(t => t.type === 'audio').length + 1), type: 'audio', order: state.tracks.length });
    renderTracks();
    renderTimeline();
    saveToStorage();
}

function moveTrackUp(trackId) {
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Find tracks of same type
    const sameType = state.tracks.filter(t => t.type === track.type).sort((a, b) => a.order - b.order);
    const idx = sameType.indexOf(track);

    if (idx > 0) {
        // Swap orders with previous track of same type
        const prev = sameType[idx - 1];
        const tempOrder = track.order;
        track.order = prev.order;
        prev.order = tempOrder;

        renderTracks();
        renderTimeline();
        saveToStorage();
    }
}

function moveTrackDown(trackId) {
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Find tracks of same type
    const sameType = state.tracks.filter(t => t.type === track.type).sort((a, b) => a.order - b.order);
    const idx = sameType.indexOf(track);

    if (idx < sameType.length - 1) {
        // Swap orders with next track of same type
        const next = sameType[idx + 1];
        const tempOrder = track.order;
        track.order = next.order;
        next.order = tempOrder;

        renderTracks();
        renderTimeline();
        saveToStorage();
    }
}

// ========================================
// TIMELINE RENDERING
// ========================================
function renderTimeline() {
    // Build track lookup from dynamic tracks
    const trackLookup = {};
    state.tracks.forEach(t => {
        const el = document.getElementById('track_' + t.id);
        if (el) {
            trackLookup[t.id] = el;
            el.innerHTML = '';
        }
    });

    // Legacy support for old track IDs
    const legacyMap = {
        'video': 'video1',
        'videoOverlay': 'video2',
        'overlay1': 'text1',
        'overlay2': 'text2',
        'audio': 'audio1'
    };

    const pps = 10 * state.zoom;

    state.clips.forEach(clip => {
        // Map legacy track IDs to new format
        let trackId = legacyMap[clip.track] || clip.track;
        const trackEl = trackLookup[trackId];
        if (!trackEl) return;

        const clipEl = document.createElement('div');
        clipEl.className = `clip ${clip.type}`;
        clipEl.dataset.clipId = clip.id;
        clipEl.style.left = `${clip.startTime * pps}px`;
        clipEl.style.width = `${(clip.endTime - clip.startTime) * pps}px`;

        // Add resize handles
        const leftHandle = document.createElement('div');
        leftHandle.className = 'clip-handle left';
        leftHandle.addEventListener('mousedown', (e) => startClipResize(e, clip, 'left'));

        const rightHandle = document.createElement('div');
        rightHandle.className = 'clip-handle right';
        rightHandle.addEventListener('mousedown', (e) => startClipResize(e, clip, 'right'));

        const labelSpan = document.createElement('span');
        labelSpan.textContent = clip.type === 'overlay' ? clip.text : (clip.label || clip.type);
        labelSpan.style.pointerEvents = 'none';

        clipEl.appendChild(leftHandle);
        clipEl.appendChild(labelSpan);
        clipEl.appendChild(rightHandle);

        if (state.selectedClip && state.selectedClip.id === clip.id) {
            clipEl.classList.add('selected');
        }

        clipEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('clip-handle')) selectClip(clip.id, e);
        });
        clipEl.addEventListener('dblclick', () => editClip(clip.id));
        clipEl.addEventListener('contextmenu', (e) => showContextMenu(e, clip.id));

        makeDraggable(clipEl, clip);
        trackEl.appendChild(clipEl);
    });

    updatePlayhead();
}

// ========================================
// CLIP RESIZING (drag edges)
// ========================================
function startClipResize(e, clip, side) {
    e.stopPropagation();
    e.preventDefault();

    const pps = 10 * state.zoom;
    const startX = e.clientX;
    const startStart = clip.startTime;
    const startEnd = clip.endTime;

    function onMove(ev) {
        const deltaX = ev.clientX - startX;
        const deltaTime = deltaX / pps;

        if (side === 'left') {
            clip.startTime = Math.max(0, Math.min(clip.endTime - 0.1, startStart + deltaTime));
        } else {
            clip.endTime = Math.max(clip.startTime + 0.1, Math.min(state.duration, startEnd + deltaTime));
        }

        renderTimeline();
    }

    function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        saveToStorage();
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function renderRuler() {
    const ruler = document.getElementById('timelineRuler');
    ruler.innerHTML = '';

    const pps = 10 * state.zoom;
    const interval = state.zoom >= 2 ? 1 : (state.zoom >= 1 ? 5 : 10);

    for (let t = 0; t <= state.duration; t += interval) {
        const marker = document.createElement('div');
        marker.className = 'ruler-marker';
        marker.style.left = `${t * pps}px`;
        const min = Math.floor(t / 60);
        const sec = t % 60;
        marker.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        ruler.appendChild(marker);
    }

    ruler.style.width = `${state.duration * pps}px`;

    document.querySelectorAll('.track-content').forEach(tc => {
        tc.style.minWidth = `${state.duration * pps + 50}px`;
    });
}

function updatePlayhead() {
    const playhead = document.getElementById('playhead');
    const pps = 10 * state.zoom;
    playhead.style.left = `${80 + state.currentTime * pps}px`;
}

// ========================================
// CLIP OPERATIONS
// ========================================
function selectClip(clipId, event) {
    if (event) event.stopPropagation();
    state.selectedClip = state.clips.find(c => c.id === clipId) || null;
    renderTimeline();
    renderProperties();
    document.getElementById('propertiesPanel').classList.remove('hidden');
}

function closeProperties() {
    state.selectedClip = null;
    document.getElementById('propertiesPanel').classList.add('hidden');
    renderTimeline();
}

function addTextOverlay() {
    const clip = {
        id: state.nextClipId++,
        type: 'overlay',
        track: 'overlay1',
        startTime: state.currentTime,
        endTime: Math.min(state.currentTime + 3, state.duration),
        text: 'New Text',
        style: 'big',
        position: 'center',
        posX: 50, posY: 50,
        fontSize: 48,
        color: '#ffffff',
        animation: 'fadeIn'
    };
    state.clips.push(clip);
    state.selectedClip = clip;
    renderTimeline();
    renderProperties();
    saveToStorage();
}

function addTransition() {
    const clip = {
        id: state.nextClipId++,
        type: 'effect',
        track: 'effects',
        startTime: state.currentTime,
        endTime: state.currentTime + 0.5,
        label: 'Fade',
        transitionType: 'fade'
    };
    state.clips.push(clip);
    state.selectedClip = clip;
    renderTimeline();
    renderProperties();
    saveToStorage();
}

function addAudioTrackClip() {
    const clip = {
        id: state.nextClipId++,
        type: 'audio',
        track: 'audio',
        startTime: state.currentTime,
        endTime: Math.min(state.currentTime + 5, state.duration),
        label: 'Audio',
        audioSrc: null
    };
    state.clips.push(clip);
    state.selectedClip = clip;
    renderTimeline();
    renderProperties();
    saveToStorage();
}

function deleteSelected() {
    if (state.selectedClip) {
        state.clips = state.clips.filter(c => c.id !== state.selectedClip.id);
        state.selectedClip = null;
        renderTimeline();
        renderProperties();
        saveToStorage();
    }
}

function quickAddSFX(type) {
    const audioTrack = state.tracks.find(t => t.type === 'audio') || state.tracks[0];
    const newClip = {
        id: Date.now(),
        type: 'audio',
        track: audioTrack.id,
        startTime: state.currentTime,
        endTime: state.currentTime + 1,
        label: `SFX: ${type.toUpperCase()}`,
        needsAudio: true,
        bgType: 'sfx'
    };
    state.clips.push(newClip);
    renderTimeline();
    saveToStorage();
}

function toggleProgressBar() {
    state.showProgressBar = !state.showProgressBar;
    const btn = document.getElementById('progressBarBtn');
    if (btn) {
        btn.classList.toggle('active', state.showProgressBar);
        btn.style.background = state.showProgressBar ? 'var(--brand)' : '';
    }
    saveToStorage();
}

function duplicateSelected() {
    if (!state.selectedClip) return;
    const newClip = { ...state.selectedClip, id: state.nextClipId++, startTime: state.selectedClip.endTime };
    newClip.endTime = newClip.startTime + (state.selectedClip.endTime - state.selectedClip.startTime);
    if (newClip.endTime > state.duration) {
        const dur = newClip.endTime - newClip.startTime;
        newClip.startTime = state.currentTime;
        newClip.endTime = newClip.startTime + dur;
    }
    state.clips.push(newClip);
    state.selectedClip = newClip;
    renderTimeline();
    renderProperties();
    hideContextMenu();
    saveToStorage();
}

function editClip(clipId) {
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip) return;

    // Select the clip and show properties panel for editing
    state.selectedClip = clip;
    renderProperties();
    document.getElementById('propertiesPanel').classList.remove('hidden');
}

function editSelectedClip() {
    if (state.selectedClip) editClip(state.selectedClip.id);
    hideContextMenu();
}

// ========================================
// CONTEXT MENU
// ========================================
function showContextMenu(e, clipId) {
    e.preventDefault();
    selectClip(clipId);
    const menu = document.getElementById('contextMenu');
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.add('active');
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.remove('active');
}

document.addEventListener('click', hideContextMenu);

// ========================================
// PROPERTIES PANEL
// ========================================
function renderProperties() {
    const container = document.getElementById('propertiesContent');

    if (!state.selectedClip) {
        container.innerHTML = '<div class="property-group"><p style="color: var(--text-muted); font-size: 11px;">Select a clip</p></div>';
        return;
    }

    const clip = state.selectedClip;

    if (clip.type === 'overlay') {
        const overlayTracks = state.tracks.filter(t => t.type === 'overlay');
        const trackOptions = overlayTracks.map(t =>
            `<option value="${t.id}" ${clip.track === t.id ? 'selected' : ''}>${t.name}</option>`
        ).join('');

        container.innerHTML = `
            <div class="property-group">
                <label>Track</label>
                <select onchange="updateClipProp('track', this.value)">
                    ${trackOptions}
                </select>
            </div>
            <div class="property-group">
                <label>Text Content</label>
                <textarea oninput="updateClipProp('text', this.value)">${clip.text || ''}</textarea>
                <div style="display:flex; gap:4px; margin-top:4px; overflow-x:auto; padding-bottom:4px;">
                    <button class="btn btn-secondary btn-sm" onclick="appendEmoji('🔥')">🔥</button>
                    <button class="btn btn-secondary btn-sm" onclick="appendEmoji('✨')">✨</button>
                    <button class="btn btn-secondary btn-sm" onclick="appendEmoji('🚨')">🚨</button>
                    <button class="btn btn-secondary btn-sm" onclick="appendEmoji('💎')">💎</button>
                    <button class="btn btn-secondary btn-sm" onclick="appendEmoji('✅')">✅</button>
                    <button class="btn btn-secondary btn-sm" onclick="appendEmoji('💬')">💬</button>
                    <button class="btn btn-secondary btn-sm" onclick="appendEmoji('👇')">👇</button>
                </div>
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div>
                        <label>Position X %</label>
                        <input type="number" min="0" max="100" value="${clip.posX || 50}" onchange="updateClipProp('posX', parseFloat(this.value))">
                    </div>
                    <div>
                        <label>Position Y %</label>
                        <input type="number" min="0" max="100" value="${clip.posY || 50}" onchange="updateClipProp('posY', parseFloat(this.value))">
                    </div>
                </div>
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div>
                        <label>Font Size</label>
                        <input type="number" value="${clip.fontSize}" onchange="updateClipProp('fontSize', parseInt(this.value))">
                    </div>
                    <div>
                        <label>Color</label>
                        <input type="color" value="${clip.color}" onchange="updateClipProp('color', this.value)">
                    </div>
                </div>
            </div>
            <div class="property-group">
                <label>Font</label>
                <select onchange="updateClipProp('fontFamily', this.value)">
                    <option value="Inter" ${(clip.fontFamily || 'Inter') === 'Inter' ? 'selected' : ''}>Inter (Clean)</option>
                    <option value="Bebas Neue" ${clip.fontFamily === 'Bebas Neue' ? 'selected' : ''}>Bebas Neue (Bold)</option>
                    <option value="Anton" ${clip.fontFamily === 'Anton' ? 'selected' : ''}>Anton (Impact)</option>
                    <option value="Oswald" ${clip.fontFamily === 'Oswald' ? 'selected' : ''}>Oswald (Modern)</option>
                    <option value="Poppins" ${clip.fontFamily === 'Poppins' ? 'selected' : ''}>Poppins (Rounded)</option>
                    <option value="Montserrat" ${clip.fontFamily === 'Montserrat' ? 'selected' : ''}>Montserrat (Geometric)</option>
                    <option value="Bangers" ${clip.fontFamily === 'Bangers' ? 'selected' : ''}>Bangers (Comic)</option>
                    <option value="Archivo Black" ${clip.fontFamily === 'Archivo Black' ? 'selected' : ''}>Archivo Black (Heavy)</option>
                    <option value="Passion One" ${clip.fontFamily === 'Passion One' ? 'selected' : ''}>Passion One (Tall)</option>
                </select>
            </div>
            <div class="property-group">
                <label>Background Style</label>
                <select onchange="updateClipProp('textStyle', this.value)">
                    <option value="none" ${clip.textStyle === 'none' ? 'selected' : ''}>None (Shadow)</option>
                    <option value="label-white" ${clip.textStyle === 'label-white' ? 'selected' : ''}>⬜ White Label</option>
                    <option value="label-black" ${clip.textStyle === 'label-black' ? 'selected' : ''}>⬛ Black Label</option>
                    <option value="label-brand" ${clip.textStyle === 'label-brand' ? 'selected' : ''}>💎 Brand Label</option>
                    <option value="outline" ${clip.textStyle === 'outline' ? 'selected' : ''}>🔳 Outline</option>
                    <option value="neon" ${clip.textStyle === 'neon' ? 'selected' : ''}>💡 Neon Glow</option>
                </select>
            </div>
            <div class="property-group">
                <label>Animation</label>
                <select onchange="updateClipProp('animation', this.value)">
                    <optgroup label="Basic">
                        <option value="none" ${clip.animation === 'none' ? 'selected' : ''}>None</option>
                        <option value="fadeIn" ${clip.animation === 'fadeIn' ? 'selected' : ''}>Fade In</option>
                        <option value="scale" ${clip.animation === 'scale' ? 'selected' : ''}>Scale/Pop</option>
                    </optgroup>
                    <optgroup label="Slide">
                        <option value="slideUp" ${clip.animation === 'slideUp' ? 'selected' : ''}>Slide Up</option>
                        <option value="slideDown" ${clip.animation === 'slideDown' ? 'selected' : ''}>Slide Down</option>
                        <option value="slideLeft" ${clip.animation === 'slideLeft' ? 'selected' : ''}>Slide Left</option>
                        <option value="slideRight" ${clip.animation === 'slideRight' ? 'selected' : ''}>Slide Right</option>
                    </optgroup>
                    <optgroup label="TikTok Viral">
                        <option value="bounce" ${clip.animation === 'bounce' ? 'selected' : ''}>🔥 Bounce</option>
                        <option value="shake" ${clip.animation === 'shake' ? 'selected' : ''}>📳 Shake</option>
                        <option value="glow" ${clip.animation === 'glow' ? 'selected' : ''}>✨ Glow Pulse</option>
                        <option value="zoom" ${clip.animation === 'zoom' ? 'selected' : ''}>🔍 Zoom In-Out</option>
                        <option value="wiggle" ${clip.animation === 'wiggle' ? 'selected' : ''}>〰️ Wiggle</option>
                        <option value="explode" ${clip.animation === 'explode' ? 'selected' : ''}>💥 Explode In</option>
                        <option value="glitch" ${clip.animation === 'glitch' ? 'selected' : ''}>📺 Glitch</option>
                        <option value="rainbow" ${clip.animation === 'rainbow' ? 'selected' : ''}>🌈 Rainbow</option>
                    </optgroup>
                    <optgroup label="Impact">
                        <option value="stomp" ${clip.animation === 'stomp' ? 'selected' : ''}>👊 Stomp</option>
                        <option value="slam" ${clip.animation === 'slam' ? 'selected' : ''}>💢 Slam Down</option>
                        <option value="whip" ${clip.animation === 'whip' ? 'selected' : ''}>⚡ Whip In</option>
                        <option value="drop" ${clip.animation === 'drop' ? 'selected' : ''}>⬇️ Drop</option>
                        <option value="rubberband" ${clip.animation === 'rubberband' ? 'selected' : ''}>🪀 Rubber Band</option>
                    </optgroup>
                    <optgroup label="Attention">
                        <option value="pulse" ${clip.animation === 'pulse' ? 'selected' : ''}>💓 Pulse</option>
                        <option value="heartbeat" ${clip.animation === 'heartbeat' ? 'selected' : ''}>💗 Heartbeat</option>
                        <option value="spin" ${clip.animation === 'spin' ? 'selected' : ''}>🔄 Spin In</option>
                        <option value="flip" ${clip.animation === 'flip' ? 'selected' : ''}>🔃 Flip</option>
                        <option value="jello" ${clip.animation === 'jello' ? 'selected' : ''}>🍮 Jello</option>
                    </optgroup>
                    <optgroup label="Glow & Neon">
                        <option value="neon" ${clip.animation === 'neon' ? 'selected' : ''}>💡 Neon Flicker</option>
                        <option value="fire" ${clip.animation === 'fire' ? 'selected' : ''}>🔥 Fire Text</option>
                        <option value="spotlight" ${clip.animation === 'spotlight' ? 'selected' : ''}>🔦 Spotlight</option>
                        <option value="shadowDrop" ${clip.animation === 'shadowDrop' ? 'selected' : ''}>🌑 Shadow Drop</option>
                    </optgroup>
                    <optgroup label="3D Effects">
                        <option value="rotate3d" ${clip.animation === 'rotate3d' ? 'selected' : ''}>🎲 3D Rotate</option>
                        <option value="wave" ${clip.animation === 'wave' ? 'selected' : ''}>🌊 Wave</option>
                    </optgroup>
                    <optgroup label="Text Effects">
                        <option value="typewriter" ${clip.animation === 'typewriter' ? 'selected' : ''}>⌨️ Typewriter</option>
                        <option value="drawOn" ${clip.animation === 'drawOn' ? 'selected' : ''}>✏️ Draw On</option>
                        <option value="wordByWord" ${clip.animation === 'wordByWord' ? 'selected' : ''}>📝 Word by Word</option>
                    </optgroup>
                </select>
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div>
                        <label>Start (s)</label>
                        <input type="number" step="0.1" value="${clip.startTime}" onchange="updateClipProp('startTime', parseFloat(this.value))">
                    </div>
                    <div>
                        <label>End (s)</label>
                        <input type="number" step="0.1" value="${clip.endTime}" onchange="updateClipProp('endTime', parseFloat(this.value))">
                    </div>
                </div>
            </div>
        `;
    } else if (clip.type === 'video') {
        const videoTracks = state.tracks.filter(t => t.type === 'video');
        const trackOptions = videoTracks.map(t =>
            `<option value="${t.id}" ${clip.track === t.id ? 'selected' : ''}>${t.name}</option>`
        ).join('');

        container.innerHTML = `
            <div class="property-group">
                <label>Track</label>
                <select onchange="updateClipProp('track', this.value)">
                    ${trackOptions}
                </select>
            </div>
            <div class="property-group">
                <label>Label</label>
                <input type="text" value="${clip.label || ''}" onchange="updateClipProp('label', this.value)">
            </div>
            <div class="property-group">
                <label>Description</label>
                <textarea style="height:40px" onchange="updateClipProp('description', this.value)">${clip.description || ''}</textarea>
            </div>
            ${clip.soraPrompt ? `
            <div class="property-group">
                <label>Sora Prompt</label>
                <textarea style="height:60px;font-size:10px" onchange="updateClipProp('soraPrompt', this.value)">${clip.soraPrompt}</textarea>
            </div>
            ` : ''}
            <div class="property-group">
                <label>Video ${clip.needsVideo ? '<span style="color:var(--warning)">(needed)</span>' : ''}</label>
                <button class="btn btn-secondary" style="width:100%" onclick="uploadVideoForClip(${clip.id})">📁 Choose</button>
                ${clip.videoSrc ? '<p style="font-size:10px;color:var(--success);margin-top:4px;">✓ Loaded</p>' : ''}
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div>
                        <label>Entry Animation</label>
                        <select onchange="updateClipProp('inAnimation', this.value)">
                            <option value="none" ${clip.inAnimation === 'none' ? 'selected' : ''}>None</option>
                            <option value="pop" ${clip.inAnimation === 'pop' ? 'selected' : ''}>💥 Pop Up</option>
                            <option value="fadeIn" ${clip.inAnimation === 'fadeIn' ? 'selected' : ''}>🌑 Fade In</option>
                            <option value="slideUp" ${clip.inAnimation === 'slideUp' ? 'selected' : ''}>⬆️ Slide Up</option>
                            <option value="slideDown" ${clip.inAnimation === 'slideDown' ? 'selected' : ''}>⬇️ Slide Down</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="property-row">
                <div class="property-group">
                    <label>Clip Layout</label>
                    <select onchange="updateClipProp('layout', this.value)">
                        <option value="full" ${clip.layout === 'full' || !clip.layout ? 'selected' : ''}>📱 Full Screen</option>
                        <option value="top" ${clip.layout === 'top' ? 'selected' : ''}>🔼 Top Half</option>
                        <option value="bottom" ${clip.layout === 'bottom' ? 'selected' : ''}>🔽 Bottom Half</option>
                        <option value="left" ${clip.layout === 'left' ? 'selected' : ''}>⬅️ Left Half</option>
                        <option value="right" ${clip.layout === 'right' ? 'selected' : ''}>➡️ Right Half</option>
                    </select>
                </div>
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div>
                        <label>Continuous Motion</label>
                        <select onchange="updateClipProp('motion', this.value)">
                            <option value="none" ${clip.motion === 'none' ? 'selected' : ''}>None</option>
                            <option value="slowZoom" ${clip.motion === 'slowZoom' ? 'selected' : ''}>🔍 Slow Zoom In</option>
                            <option value="slowZoomOut" ${clip.motion === 'slowZoomOut' ? 'selected' : ''}>🔍 Slow Zoom Out</option>
                            <option value="panLeft" ${clip.motion === 'panLeft' ? 'selected' : ''}>⬅️ Pan Left</option>
                            <option value="panRight" ${clip.motion === 'panRight' ? 'selected' : ''}>➡️ Pan Right</option>
                            <option value="breathe" ${clip.motion === 'breathe' ? 'selected' : ''}>🧘 Breathe</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div>
                        <label>Visual Filter</label>
                        <select onchange="updateClipProp('filter', this.value)">
                            <option value="none" ${clip.filter === 'none' ? 'selected' : ''}>None</option>
                            <option value="vibrant" ${clip.filter === 'vibrant' ? 'selected' : ''}>🎨 Vibrant</option>
                            <option value="warm" ${clip.filter === 'warm' ? 'selected' : ''}>🌅 Warm</option>
                            <option value="cold" ${clip.filter === 'cold' ? 'selected' : ''}>❄️ Cold</option>
                            <option value="grayscale" ${clip.filter === 'grayscale' ? 'selected' : ''}>🏁 B&W</option>
                            <option value="sepia" ${clip.filter === 'sepia' ? 'selected' : ''}>📜 Sepia</option>
                            <option value="dark" ${clip.filter === 'dark' ? 'selected' : ''}>🌑 Dark</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div><label>Start</label><input type="number" step="0.1" value="${clip.startTime}" onchange="updateClipProp('startTime', parseFloat(this.value))"></div>
                    <div><label>End</label><input type="number" step="0.1" value="${clip.endTime}" onchange="updateClipProp('endTime', parseFloat(this.value))"></div>
                </div>
            </div>
        `;
    } else if (clip.type === 'effect') {
        container.innerHTML = `
            <div class="property-group">
                <label>Type</label>
                <select onchange="updateClipProp('transitionType', this.value); updateClipProp('label', this.value);">
                    <option value="fade" ${clip.transitionType === 'fade' ? 'selected' : ''}>Fade</option>
                    <option value="wipeLeft" ${clip.transitionType === 'wipeLeft' ? 'selected' : ''}>Wipe Left</option>
                    <option value="wipeUp" ${clip.transitionType === 'wipeUp' ? 'selected' : ''}>Wipe Up</option>
                    <option value="blur" ${clip.transitionType === 'blur' ? 'selected' : ''}>Blur</option>
                    <option value="zoomCloud" ${clip.transitionType === 'zoomCloud' ? 'selected' : ''}>Zoom Cloud</option>
                    <option value="whipPan" ${clip.transitionType === 'whipPan' ? 'selected' : ''}>Whip Pan</option>
                    <option value="flare" ${clip.transitionType === 'flare' ? 'selected' : ''}>Flare</option>
                    <option value="glitchHeavy" ${clip.transitionType === 'glitchHeavy' ? 'selected' : ''}>Glitch Heavy</option>
                    <option value="ghost" ${clip.transitionType === 'ghost' ? 'selected' : ''}>Ghost</option>
                    <option value="bloom" ${clip.transitionType === 'bloom' ? 'selected' : ''}>Bloom</option>
                    <option value="warp" ${clip.transitionType === 'warp' ? 'selected' : ''}>Warp</option>
                </select>
            </div>
            <div class="property-group">
                <label>Duration (s)</label>
                <input type="number" step="0.1" min="0.1" max="2" value="${clip.endTime - clip.startTime}" 
                    onchange="updateClipProp('endTime', state.selectedClip.startTime + parseFloat(this.value))">
            </div>
        `;
    } else if (clip.type === 'audio') {
        const audioTracks = state.tracks.filter(t => t.type === 'audio');
        const trackOptions = audioTracks.map(t =>
            `<option value="${t.id}" ${clip.track === t.id ? 'selected' : ''}>${t.name}</option>`
        ).join('');

        container.innerHTML = `
            <div class="property-group">
                <label>Track</label>
                <select onchange="updateClipProp('track', this.value)">
                    ${trackOptions}
                </select>
            </div>
            <div class="property-group">
                <label>Label</label>
                <input type="text" value="${clip.label || ''}" onchange="updateClipProp('label', this.value)">
            </div>
            ${clip.script ? `
            <div class="property-group">
                <label>Script</label>
                <textarea style="height:60px;font-size:11px" onchange="updateClipProp('script', this.value)">${clip.script}</textarea>
            </div>
            ` : ''}
            <div class="property-group">
                <label>Audio ${clip.needsAudio ? '<span style="color:var(--warning)">(needed)</span>' : ''}</label>
                <button class="btn btn-secondary" style="width:100%" onclick="uploadAudioForClip(${clip.id})">🔊 Choose</button>
                ${clip.audioSrc ? '<p style="font-size:10px;color:var(--success);margin-top:4px;">✓ Loaded</p>' : ''}
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div><label>Start</label><input type="number" step="0.1" value="${clip.startTime}" onchange="updateClipProp('startTime', parseFloat(this.value))"></div>
                    <div><label>End</label><input type="number" step="0.1" value="${clip.endTime}" onchange="updateClipProp('endTime', parseFloat(this.value))"></div>
                </div>
            </div>
        `;
    } else if (clip.type === 'caption') {
        // Caption clip properties
        container.innerHTML = `
            <div class="property-group">
                <label>Font Size</label>
                <div class="property-row">
                    <input type="range" min="24" max="120" value="${clip.fontSize || 48}" 
                        style="flex:2" oninput="updateClipProp('fontSize', parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px'">
                    <span style="width:50px;text-align:right">${clip.fontSize || 48}px</span>
                </div>
            </div>
            <div class="property-group">
                <label>Vertical Position</label>
                <div class="property-row">
                    <input type="range" min="20" max="95" value="${clip.posY || 78}" 
                        style="flex:2" oninput="updateClipProp('posY', parseInt(this.value)); this.nextElementSibling.textContent = this.value + '%'">
                    <span style="width:50px;text-align:right">${clip.posY || 78}%</span>
                </div>
            </div>
            <div class="property-row" style="gap:12px">
                <div class="property-group" style="flex:1">
                    <label>Words/Screen</label>
                    <input type="number" min="2" max="8" value="${clip.wordsPerScreen || 4}" 
                        onchange="updateClipProp('wordsPerScreen', parseInt(this.value))">
                </div>
                <div class="property-group" style="flex:1">
                    <label>Style</label>
                    <select onchange="updateClipProp('style', this.value)">
                        <option value="tiktok" ${clip.style === 'tiktok' ? 'selected' : ''}>TikTok</option>
                        <option value="bounce" ${clip.style === 'bounce' ? 'selected' : ''}>Bounce</option>
                        <option value="karaoke" ${clip.style === 'karaoke' ? 'selected' : ''}>Karaoke</option>
                        <option value="subtitle" ${clip.style === 'subtitle' ? 'selected' : ''}>Subtitle</option>
                    </select>
                </div>
            </div>
            <div class="property-row" style="gap:12px">
                <div class="property-group" style="flex:1">
                    <label>Font</label>
                    <select onchange="updateClipProp('fontFamily', this.value)">
                        <option value="Bebas Neue" ${clip.fontFamily === 'Bebas Neue' ? 'selected' : ''}>Bebas Neue</option>
                        <option value="Anton" ${clip.fontFamily === 'Anton' ? 'selected' : ''}>Anton</option>
                        <option value="Montserrat" ${clip.fontFamily === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
                        <option value="Poppins" ${clip.fontFamily === 'Poppins' ? 'selected' : ''}>Poppins</option>
                        <option value="Bangers" ${clip.fontFamily === 'Bangers' ? 'selected' : ''}>Bangers</option>
                    </select>
                </div>
                <div class="property-group" style="flex:1">
                    <label>Highlight</label>
                    <input type="color" value="${clip.highlightColor || '#FFE135'}" 
                        onchange="updateClipProp('highlightColor', this.value)">
                </div>
            </div>
            <div class="property-group">
                <div class="property-row">
                    <div><label>Start</label><input type="number" step="0.1" value="${clip.startTime}" onchange="updateClipProp('startTime', parseFloat(this.value))"></div>
                    <div><label>End</label><input type="number" step="0.1" value="${clip.endTime}" onchange="updateClipProp('endTime', parseFloat(this.value))"></div>
                </div>
            </div>
            <div class="property-group">
                <button class="btn btn-secondary" style="width:100%" onclick="splitCaptionClip()">
                    ✂️ Split Caption at Playhead
                </button>
            </div>
        `;
    }
}

function updateClipProp(prop, value) {
    if (!state.selectedClip) return;
    state.selectedClip[prop] = value;
    renderTimeline();
    renderPreview();
    saveToStorage();
}

function appendEmoji(emoji) {
    if (state.selectedClip && state.selectedClip.type === 'overlay') {
        state.selectedClip.text = (state.selectedClip.text || '') + emoji;
        renderProperties();
        renderPreview();
        saveToStorage();
    }
}
// Split caption clip at playhead
function splitCaptionClip() {
    const clip = state.selectedClip;
    if (!clip || clip.type !== 'caption') {
        console.log('No caption clip selected');
        return;
    }

    const splitTime = state.currentTime;

    if (splitTime <= clip.startTime || splitTime >= clip.endTime) {
        console.log('Playhead must be within caption clip');
        return;
    }

    // Find which word the split happens at
    const words = clip.words || [];
    let splitWordIndex = 0;

    for (let i = 0; i < words.length; i++) {
        if (words[i].startTime >= splitTime) {
            splitWordIndex = i;
            break;
        }
        splitWordIndex = i + 1;
    }

    if (splitWordIndex === 0 || splitWordIndex >= words.length) {
        console.log('Cannot split - no words at split point');
        return;
    }

    // Create first part (words before split)
    const firstWords = words.slice(0, splitWordIndex).map((w, i) => ({ ...w, index: i }));

    // Create second part (words after split)
    const secondWords = words.slice(splitWordIndex).map((w, i) => ({ ...w, index: i }));

    // Update original clip to be first part
    clip.endTime = splitTime;
    clip.words = firstWords;

    // Create new clip for second part
    const newClip = {
        id: state.nextClipId++,
        type: 'caption',
        track: clip.track,
        startTime: splitTime,
        endTime: words[words.length - 1].endTime,
        label: 'Captions (2)',
        words: secondWords,
        style: clip.style,
        fontFamily: clip.fontFamily,
        fontSize: clip.fontSize,
        color: clip.color,
        highlightColor: clip.highlightColor,
        wordsPerScreen: clip.wordsPerScreen,
        posY: clip.posY
    };

    state.clips.push(newClip);

    renderTimeline();
    renderPreview();
    renderProperties();
    saveToStorage();

    console.log(`Split caption: First part has ${firstWords.length} words, second part has ${secondWords.length} words`);
}

// ========================================
// DRAG & DROP CLIPS
// ========================================
function makeDraggable(el, clip) {
    let isDragging = false;
    let startX, startLeft;

    el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('clip-handle')) return;
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX;
        startLeft = clip.startTime;
        el.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const pps = 10 * state.zoom;
        const deltaX = e.clientX - startX;
        const deltaTime = deltaX / pps;
        const duration = clip.endTime - clip.startTime;

        clip.startTime = Math.max(0, startLeft + deltaTime);
        clip.endTime = clip.startTime + duration;

        el.style.left = `${clip.startTime * pps}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            el.style.cursor = 'grab';
            renderTimeline();
            saveToStorage();
        }
    });
}

// ========================================
// CANVAS INTERACTION - Drag overlays in preview
// ========================================
function setupCanvasInteraction() {
    let draggingOverlay = null;
    let startMouseX, startMouseY, startPosX, startPosY;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Find overlay at this position
        const activeOverlays = state.clips.filter(c =>
            c.type === 'overlay' && state.currentTime >= c.startTime && state.currentTime < c.endTime
        );

        for (const overlay of activeOverlays) {
            const pos = getOverlayCanvasPosition(overlay);
            const hw = ctx.measureText(overlay.text).width / 2 + 20;
            const hh = overlay.fontSize / 2 + 10;

            if (x >= pos.x - hw && x <= pos.x + hw && y >= pos.y - hh && y <= pos.y + hh) {
                draggingOverlay = overlay;
                startMouseX = x;
                startMouseY = y;
                startPosX = overlay.posX || 50;
                startPosY = overlay.posY || 50;
                state.selectedClip = overlay;
                renderProperties();
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!draggingOverlay) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const deltaX = (x - startMouseX) / canvas.width * 100;
        const deltaY = (y - startMouseY) / canvas.height * 100;

        draggingOverlay.posX = Math.max(5, Math.min(95, startPosX + deltaX));
        draggingOverlay.posY = Math.max(5, Math.min(95, startPosY + deltaY));

        renderPreview();
        renderProperties();
    });

    canvas.addEventListener('mouseup', () => {
        if (draggingOverlay) {
            draggingOverlay = null;
            saveToStorage();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        draggingOverlay = null;
    });
}

function getOverlayCanvasPosition(clip) {
    const x = (clip.posX || 50) / 100 * canvas.width;
    const y = (clip.posY || 50) / 100 * canvas.height;
    return { x, y };
}

// ========================================
// PLAYBACK
// ========================================
function togglePlay() {
    state.isPlaying = !state.isPlaying;
    document.getElementById('playBtn').textContent = state.isPlaying ? '⏸' : '▶';
    if (state.isPlaying) {
        state.lastFrameTime = performance.now();
        // Start audio playback
        state.clips.filter(c => c.type === 'audio' && c.audioElement).forEach(clip => {
            if (state.currentTime >= clip.startTime && state.currentTime < clip.endTime) {
                clip.audioElement.currentTime = state.currentTime - clip.startTime;
                clip.audioElement.play();
            }
        });
    } else {
        // Pause audio
        state.clips.filter(c => c.type === 'audio' && c.audioElement).forEach(clip => {
            clip.audioElement.pause();
        });
    }
}

function skipBack() {
    state.currentTime = Math.max(0, state.currentTime - 5);
    updatePlayhead();
    updateTimeDisplay();
    renderPreview();
}

function skipForward() {
    state.currentTime = Math.min(state.duration, state.currentTime + 5);
    updatePlayhead();
    updateTimeDisplay();
    renderPreview();
}

function updateTimeDisplay() {
    const formatTime = (t) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    document.getElementById('currentTime').textContent = formatTime(state.currentTime);
    document.getElementById('totalTime').textContent = formatTime(state.duration);
}

// ========================================
// PREVIEW RENDERING
// ========================================
function renderLoop() {
    if (state.isPlaying) {
        const now = performance.now();
        const delta = (now - state.lastFrameTime) / 1000;
        state.lastFrameTime = now;
        state.currentTime += delta;

        if (state.currentTime >= state.duration) {
            state.currentTime = 0;
            state.isPlaying = false;
            document.getElementById('playBtn').textContent = '▶';
            // Stop all audio
            state.clips.filter(c => c.type === 'audio' && c.audioElement).forEach(clip => {
                clip.audioElement.pause();
            });
        }

        // Manage audio clips
        state.clips.filter(c => c.type === 'audio' && c.audioElement).forEach(clip => {
            const isInRange = state.currentTime >= clip.startTime && state.currentTime < clip.endTime;
            if (isInRange && clip.audioElement.paused) {
                clip.audioElement.currentTime = state.currentTime - clip.startTime;
                clip.audioElement.play().catch(() => { }); // ignore autoplay errors
            } else if (!isInRange && !clip.audioElement.paused) {
                clip.audioElement.pause();
            }
        });

        updatePlayhead();
        updateTimeDisplay();
    }

    renderPreview();
    animationFrame = requestAnimationFrame(renderLoop);
}

function renderPreview() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const activeClips = state.clips.filter(c =>
        state.currentTime >= c.startTime && state.currentTime < c.endTime
    );

    // Sort video tracks by order for proper layering
    const videoTracks = state.tracks.filter(t => t.type === 'video').sort((a, b) => a.order - b.order);

    // Render videos in track order (bottom to top)
    videoTracks.forEach(track => {
        const videoClips = activeClips.filter(c => c.type === 'video' && (c.track === track.id || c.track === 'video' && track.id === 'video1'));
        videoClips.forEach(clip => renderVideoClip(clip));
    });

    // Overlays
    activeClips.filter(c => c.type === 'overlay').forEach(clip => renderOverlay(clip));

    // Captions (TikTok style word-by-word)
    activeClips.filter(c => c.type === 'caption').forEach(clip => renderCaptions(clip));

    // Effects
    activeClips.filter(c => c.type === 'effect').forEach(clip => applyTransition(clip));

    // Global Progress Bar (TikTok Style)
    if (state.showProgressBar) {
        renderGlobalProgressBar();
    }
}

const easings = {
    easeOutBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    easeOutElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2
};

function renderGlobalProgressBar() {
    const barHeight = 4;
    const progress = state.currentTime / state.duration;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

    ctx.fillStyle = '#00A6CE'; // Brand color
    ctx.fillRect(0, canvas.height - barHeight, canvas.width * progress, barHeight);
}

function renderVideoClip(clip) {
    const timeSinceStart = state.currentTime - clip.startTime;
    const clipDuration = clip.endTime - clip.startTime;
    const inAnimDuration = 0.5;
    const inProgress = Math.min(timeSinceStart / inAnimDuration, 1);

    let scale = 1, offsetX = 0, offsetY = 0, alpha = 1, rotation = 0;

    // Entry Animations
    switch (clip.inAnimation) {
        case 'pop':
            scale = easings.easeOutBack(inProgress);
            alpha = inProgress;
            break;
        case 'fadeIn':
            alpha = inProgress;
            break;
        case 'slideUp':
            offsetY = (1 - easings.easeOutBack(inProgress)) * 100;
            alpha = inProgress;
            break;
        case 'slideDown':
            offsetY = -(1 - easings.easeOutBack(inProgress)) * 100;
            alpha = inProgress;
            break;
    }

    // Continuous Motion (Ken Burns)
    const motionProgress = timeSinceStart / clipDuration;
    switch (clip.motion) {
        case 'slowZoom':
            scale *= (1 + motionProgress * 0.2);
            break;
        case 'slowZoomOut':
            scale *= (1.2 - motionProgress * 0.2);
            break;
        case 'panLeft':
            offsetX += motionProgress * 50;
            break;
        case 'panRight':
            offsetX -= motionProgress * 50;
            break;
        case 'breathe':
            scale *= (1 + Math.sin(timeSinceStart * 1.5) * 0.05);
            break;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Apply Layout Clipping
    let drawX = 0, drawY = 0, drawW = canvas.width, drawH = canvas.height;
    if (clip.layout && clip.layout !== 'full') {
        ctx.beginPath();
        if (clip.layout === 'top') {
            ctx.rect(0, 0, canvas.width, canvas.height / 2);
            drawH = canvas.height / 2;
        } else if (clip.layout === 'bottom') {
            ctx.rect(0, canvas.height / 2, canvas.width, canvas.height / 2);
            drawY = canvas.height / 2;
            drawH = canvas.height / 2;
        } else if (clip.layout === 'left') {
            ctx.rect(0, 0, canvas.width / 2, canvas.height);
            drawW = canvas.width / 2;
        } else if (clip.layout === 'right') {
            ctx.rect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
            drawX = canvas.width / 2;
            drawW = canvas.width / 2;
        }
        ctx.clip();
    }

    // Apply Filters
    if (clip.filter && clip.filter !== 'none') {
        switch (clip.filter) {
            case 'grayscale': ctx.filter = 'grayscale(100%)'; break;
            case 'sepia': ctx.filter = 'sepia(100%)'; break;
            case 'cold': ctx.filter = 'hue-rotate(180deg) saturate(1.2)'; break;
            case 'warm': ctx.filter = 'sepia(30%) saturate(1.5) brightness(1.1)'; break;
            case 'vibrant': ctx.filter = 'saturate(2) contrast(1.1)'; break;
            case 'dark': ctx.filter = 'brightness(0.6) contrast(1.2)'; break;
        }
    }

    // Apply transformations from center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);

    if (clip.videoElement) {
        ctx.drawImage(clip.videoElement, drawX, drawY, drawW, drawH);
    } else {
        // Render Placeholder
        const grd = ctx.createLinearGradient(drawX, drawY, drawX + drawW, drawY + drawH);
        if (clip.bgType === 'sora') {
            grd.addColorStop(0, '#0d4f4f'); grd.addColorStop(1, '#1a3a3a');
        } else if (clip.bgType === 'screenRecording') {
            grd.addColorStop(0, '#2a2a4a'); grd.addColorStop(1, '#1a1a2e');
        } else {
            grd.addColorStop(0, '#2d2d4a'); grd.addColorStop(1, '#1a1a2e');
        }
        ctx.fillStyle = grd;
        ctx.fillRect(drawX, drawY, drawW, drawH);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(clip.bgType === 'sora' ? '🎬 Sora Video Needed' : (clip.bgType === 'screenRecording' ? '📹 Screen Recording Needed' : '📁 Video Placeholder'), drawX + drawW / 2, drawY + drawH / 2 - 20);
        ctx.font = '12px Inter';
        ctx.fillText(clip.label || '', drawX + drawW / 2, drawY + drawH / 2 + 10);
    }

    ctx.restore();
}

function renderOverlay(clip) {
    const animDuration = 0.35;
    const animProgress = Math.min((state.currentTime - clip.startTime) / animDuration, 1);
    const timeSinceStart = state.currentTime - clip.startTime;
    let alpha = 1, offsetX = 0, offsetY = 0, scale = 1, rotation = 0;
    let displayText = clip.text;
    let glowAmount = 0;
    let colorOverride = null;

    const easeOutBack = easings.easeOutBack;
    const easeOutElastic = easings.easeOutElastic;

    switch (clip.animation) {
        case 'fadeIn':
            alpha = animProgress;
            break;
        case 'slideUp':
            offsetY = (1 - animProgress) * 50;
            alpha = animProgress;
            break;
        case 'slideDown':
            offsetY = (animProgress - 1) * 50;
            alpha = animProgress;
            break;
        case 'slideLeft':
            offsetX = (1 - animProgress) * 100;
            alpha = animProgress;
            break;
        case 'slideRight':
            offsetX = (animProgress - 1) * 100;
            alpha = animProgress;
            break;
        case 'scale':
            scale = 0.5 + animProgress * 0.5;
            alpha = animProgress;
            break;
        case 'typewriter':
            const charCount = Math.floor(animProgress * clip.text.length * 3);
            displayText = clip.text.substring(0, Math.min(charCount, clip.text.length));
            break;
        case 'drawOn':
            alpha = animProgress;
            scale = 0.95 + animProgress * 0.05;
            break;

        // TikTok Style Animations
        case 'bounce':
            if (animProgress < 1) {
                scale = easeOutElastic(animProgress);
                alpha = Math.min(animProgress * 2, 1);
            } else {
                // Subtle bounce loop
                scale = 1 + Math.sin(timeSinceStart * 4) * 0.03;
            }
            break;
        case 'shake':
            alpha = Math.min(animProgress * 2, 1);
            if (animProgress >= 1) {
                offsetX = Math.sin(timeSinceStart * 30) * 3;
                offsetY = Math.cos(timeSinceStart * 25) * 2;
            }
            break;
        case 'glow':
            alpha = animProgress;
            glowAmount = 10 + Math.sin(timeSinceStart * 4) * 8;
            break;
        case 'zoom':
            if (animProgress < 1) {
                scale = 0.3 + easeOutBack(animProgress) * 0.7;
                alpha = animProgress;
            } else {
                scale = 1 + Math.sin(timeSinceStart * 2) * 0.05;
            }
            break;
        case 'wiggle':
            alpha = Math.min(animProgress * 2, 1);
            rotation = Math.sin(timeSinceStart * 8) * 0.05;
            break;
        case 'explode':
            if (animProgress < 1) {
                scale = easeOutBack(animProgress) * 1.2;
                alpha = animProgress;
            } else {
                scale = 1;
            }
            break;
        case 'glitch':
            alpha = 1;
            if (Math.random() > 0.92) {
                offsetX = (Math.random() - 0.5) * 10;
                colorOverride = Math.random() > 0.5 ? '#ff0066' : '#00ffff';
            }
            break;
        case 'rainbow':
            alpha = animProgress;
            const hue = (timeSinceStart * 100) % 360;
            colorOverride = `hsl(${hue}, 100%, 60%)`;
            break;
        case 'wordByWord':
            const words = clip.text.split(' ');
            const wordsToShow = Math.ceil(animProgress * words.length * 2);
            displayText = words.slice(0, Math.min(wordsToShow, words.length)).join(' ');
            break;

        // NEW IMPACT ANIMATIONS
        case 'stomp':
            if (animProgress < 1) {
                scale = 2 - animProgress; // Start big, shrink to normal
                alpha = animProgress;
                offsetY = -50 * (1 - animProgress);
            }
            break;
        case 'slam':
            if (animProgress < 0.3) {
                offsetY = -100 * (1 - animProgress / 0.3);
                alpha = animProgress / 0.3;
                scale = 0.5;
            } else if (animProgress < 0.5) {
                scale = 0.5 + (animProgress - 0.3) * 2.5;
                offsetY = 0;
            } else {
                scale = 1;
            }
            break;
        case 'whip':
            if (animProgress < 1) {
                offsetX = 200 * (1 - easeOutBack(animProgress));
                rotation = (1 - animProgress) * 0.3;
                alpha = animProgress;
            }
            break;
        case 'drop':
            if (animProgress < 1) {
                const bounceProgress = easeOutElastic(animProgress);
                offsetY = -150 * (1 - bounceProgress);
                alpha = Math.min(animProgress * 2, 1);
            }
            break;
        case 'rubberband':
            if (animProgress < 1) {
                const stretch = Math.sin(animProgress * Math.PI * 3) * (1 - animProgress);
                scale = 1 + stretch * 0.3;
                alpha = animProgress;
            }
            break;

        // NEW ATTENTION ANIMATIONS
        case 'pulse':
            alpha = animProgress;
            scale = 1 + Math.sin(timeSinceStart * 6) * 0.1;
            break;
        case 'heartbeat':
            alpha = animProgress;
            const beat = Math.abs(Math.sin(timeSinceStart * 4));
            scale = 1 + beat * 0.15;
            break;
        case 'spin':
            if (animProgress < 1) {
                rotation = (1 - animProgress) * Math.PI * 2;
                scale = animProgress;
                alpha = animProgress;
            }
            break;
        case 'flip':
            if (animProgress < 1) {
                scale = Math.abs(Math.cos(animProgress * Math.PI));
                alpha = animProgress;
            }
            break;
        case 'jello':
            if (animProgress < 1) {
                scale = easeOutElastic(animProgress);
                alpha = animProgress;
            } else {
                const jelloWobble = Math.sin(timeSinceStart * 8) * 0.02;
                rotation = jelloWobble;
            }
            break;

        // NEW GLOW & NEON ANIMATIONS
        case 'neon':
            alpha = animProgress;
            const flicker = Math.random() > 0.95 ? 0.5 : 1;
            glowAmount = 15 * flicker + Math.sin(timeSinceStart * 10) * 5;
            colorOverride = clip.color || '#00ffff';
            break;
        case 'fire':
            alpha = animProgress;
            const fireHue = 20 + Math.sin(timeSinceStart * 8) * 20;
            colorOverride = `hsl(${fireHue}, 100%, 50%)`;
            glowAmount = 20 + Math.sin(timeSinceStart * 12) * 10;
            offsetY += Math.sin(timeSinceStart * 15) * 2;
            break;
        case 'spotlight':
            if (animProgress < 1) {
                alpha = animProgress;
                scale = 0.8 + animProgress * 0.2;
            }
            glowAmount = 30;
            break;
        case 'shadowDrop':
            if (animProgress < 1) {
                alpha = animProgress;
                offsetY = -30 * (1 - animProgress);
            }
            // Shadow effect handled in rendering
            break;

        // NEW 3D EFFECTS
        case 'rotate3d':
            if (animProgress < 1) {
                scale = Math.abs(Math.cos(animProgress * Math.PI / 2));
                alpha = animProgress;
            }
            break;
        case 'wave':
            alpha = animProgress;
            offsetY = Math.sin(timeSinceStart * 3) * 10;
            rotation = Math.sin(timeSinceStart * 2) * 0.05;
            break;
    }

    const fadeOutStart = clip.endTime - 0.3;
    if (state.currentTime > fadeOutStart) {
        alpha *= 1 - (state.currentTime - fadeOutStart) / 0.3;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    const pos = getOverlayCanvasPosition(clip);
    const x = pos.x + offsetX;
    const y = pos.y + offsetY;

    const fontSize = clip.fontSize * scale;
    const fontFamily = clip.fontFamily || 'Inter';
    ctx.font = `bold ${fontSize}px '${fontFamily}'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply rotation if needed
    if (rotation !== 0) {
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.translate(-x, -y);
    }

    // Style pre-processing
    let finalTextColor = colorOverride || clip.color || '#ffffff';
    let bgColor = null;
    let strokeColor = null;

    if (clip.textStyle === 'label-white') {
        bgColor = '#ffffff';
        finalTextColor = '#000000';
    } else if (clip.textStyle === 'label-black') {
        bgColor = '#000000';
        finalTextColor = '#ffffff';
    } else if (clip.textStyle === 'label-brand') {
        bgColor = '#00A6CE';
        finalTextColor = '#ffffff';
    } else if (clip.textStyle === 'outline') {
        strokeColor = '#000000';
    }

    // Shadow/Glow (disable if we have a label)
    if (!bgColor) {
        if (glowAmount > 0) {
            ctx.shadowColor = finalTextColor;
            ctx.shadowBlur = glowAmount * scale;
        } else {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10 * scale;
            ctx.shadowOffsetX = 2 * scale;
            ctx.shadowOffsetY = 2 * scale;
        }
    }

    // Draw Background Label
    if (bgColor) {
        const paddingW = 15 * scale;
        const paddingH = 8 * scale;
        const textWidth = ctx.measureText(displayText).width;
        const rectW = textWidth + paddingW * 2;
        const rectH = fontSize + paddingH * 2;

        ctx.fillStyle = bgColor;
        ctx.fillRect(x - rectW / 2, y - rectH / 2, rectW, rectH);
    }

    // Thick Outline Style
    if (strokeColor || clip.textStyle === 'outline') {
        ctx.strokeStyle = strokeColor || '#000000';
        ctx.lineWidth = 10 * scale;
        ctx.lineJoin = 'round';
        ctx.strokeText(displayText, x, y);
    }

    // Main Fill
    ctx.fillStyle = finalTextColor;
    ctx.fillText(displayText, x, y);

    ctx.restore();

    // Selection indicator
    if (state.selectedClip && state.selectedClip.id === clip.id) {
        ctx.save();
        ctx.strokeStyle = '#00A6CE';
        ctx.lineWidth = 3;
        const tw = ctx.measureText(clip.text).width;
        ctx.strokeRect(x - tw / 2 - 10, y - fontSize / 2 - 5, tw + 20, fontSize + 10);
        ctx.restore();
    }

    ctx.restore();
}

function applyTransition(clip) {
    const progress = (state.currentTime - clip.startTime) / (clip.endTime - clip.startTime);
    const duration = clip.endTime - clip.startTime;

    switch (clip.transitionType) {
        case 'fade':
            ctx.fillStyle = `rgba(0,0,0,${1 - Math.abs(progress - 0.5) * 2})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        case 'wipeLeft':
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width * (1 - progress), canvas.height);
            break;
        case 'wipeUp':
            ctx.fillStyle = '#000';
            ctx.fillRect(0, canvas.height * progress, canvas.width, canvas.height);
            break;
        case 'blur':
            // Simple blur simulation with repeated draws if needed, but for now we'll do an overlay
            ctx.fillStyle = `rgba(255,255,255,${Math.sin(progress * Math.PI) * 0.3})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        case 'zoomCloud':
            const zoomScale = 1 + Math.sin(progress * Math.PI) * 0.5;
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(zoomScale, zoomScale);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            // This would ideally affect the previous/next clips, but for now it's an effect overlay
            ctx.restore();
            break;
        case 'whipPan':
            const whipX = Math.sin(progress * Math.PI) * 100;
            ctx.save();
            ctx.translate(whipX, 0);
            ctx.restore();
            break;
        case 'flare':
            const grad = ctx.createRadialGradient(
                canvas.width * progress, canvas.height / 2, 0,
                canvas.width * progress, canvas.height / 2, canvas.width * 0.5
            );
            grad.addColorStop(0, `rgba(255,255,255,${Math.sin(progress * Math.PI) * 0.8})`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        case 'glitchHeavy':
            if (Math.random() > 0.8) {
                ctx.fillStyle = `rgba(255,0,255,0.2)`;
                ctx.fillRect(Math.random() * canvas.width, 0, 50, canvas.height);
                ctx.fillStyle = `rgba(0,255,255,0.2)`;
                ctx.fillRect(Math.random() * canvas.width, 0, 50, canvas.height);
            }
            break;
        case 'ghost':
            ctx.save();
            ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.4;
            ctx.translate(Math.sin(progress * 10) * 10, 0);
            // This is a placeholder for actual clip ghosting
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
            break;
        case 'bloom':
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(255,255,255,${Math.sin(progress * Math.PI) * 0.5})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            break;
        case 'warp':
            const warpX = Math.sin(progress * Math.PI) * 20;
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.sin(progress * Math.PI) * 0.1);
            ctx.scale(1 + Math.sin(progress * Math.PI) * 0.1, 1);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.restore();
            break;
    }
}

// ========================================
// FILE UPLOADS
// ========================================
function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.loop = true;
    video.play();

    const clip = {
        id: state.nextClipId++,
        type: 'video',
        track: 'video',
        startTime: 0,
        endTime: state.duration,
        label: file.name.slice(0, 20),
        description: 'Background',
        videoSrc: url,
        videoElement: video
    };

    state.clips = state.clips.filter(c => c.type !== 'video' || c.startTime !== 0);
    state.clips.push(clip);
    renderTimeline();
    saveToStorage();
}

function uploadVideoForClip(clipId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const clip = state.clips.find(c => c.id === clipId);
        if (!clip) return;

        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.loop = true;
        video.play();

        clip.videoSrc = url;
        clip.videoElement = video;
        renderProperties();
        saveToStorage();
    };
    input.click();
}

function uploadAudioForClip(clipId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const clip = state.clips.find(c => c.id === clipId);
        if (!clip) return;

        clip.audioSrc = URL.createObjectURL(file);
        clip.label = file.name.slice(0, 15);

        // Create audio element for playback
        const audio = document.createElement('audio');
        audio.src = clip.audioSrc;
        audio.preload = 'auto';
        clip.audioElement = audio;

        renderTimeline();
        renderProperties();
        saveToStorage();
    };
    input.click();
}

// ========================================
// SPLIT CLIP
// ========================================
function splitSelectedClip() {
    if (!state.selectedClip) {
        console.log('No clip selected to split');
        return;
    }

    const clip = state.selectedClip;

    // Check if playhead is within the clip
    if (state.currentTime <= clip.startTime || state.currentTime >= clip.endTime) {
        console.log('Playhead must be within clip to split');
        return;
    }

    // Create the second half of the split
    const newClip = {
        ...clip,
        id: state.nextClipId++,
        startTime: state.currentTime,
        videoElement: clip.videoElement, // Share video element
        audioElement: clip.audioElement  // Share audio element
    };

    // Trim original clip to end at playhead
    clip.endTime = state.currentTime;

    state.clips.push(newClip);
    state.selectedClip = newClip;

    renderTimeline();
    renderProperties();
    saveToStorage();
}

// ========================================
// OVERLAY VIDEO
// ========================================
function addOverlayVideo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.loop = true;
        video.play();

        const clip = {
            id: state.nextClipId++,
            type: 'video',
            track: 'videoOverlay',
            startTime: state.currentTime,
            endTime: Math.min(state.currentTime + 10, state.duration),
            label: file.name.slice(0, 15),
            description: 'Overlay video',
            videoSrc: url,
            videoElement: video
        };

        state.clips.push(clip);
        state.selectedClip = clip;
        renderTimeline();
        renderProperties();
        saveToStorage();
    };
    input.click();
}

// ========================================
// DEFAULT WTKW BACKGROUND
// ========================================
function loadDefaultBackground() {
    // Use file input to select the WTKW background
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';

    // Try to auto-load from known path first
    const video = document.createElement('video');
    video.src = 'What%20to%20Know%20Wednesday%20-%20Jan%207th%2C%202026/WTKW%20Background.mp4';
    video.muted = true;
    video.loop = true;

    video.onloadeddata = () => {
        const clip = {
            id: state.nextClipId++,
            type: 'video',
            track: 'video1',
            startTime: 0,
            endTime: state.duration,
            label: 'WTKW Background',
            description: 'Default WTKW animated background',
            videoSrc: video.src,
            videoElement: video
        };

        state.clips = state.clips.filter(c => !(c.type === 'video' && c.track === 'video1' && c.startTime === 0));
        state.clips.push(clip);
        video.play();

        renderTimeline();
        saveToStorage();
    };

    video.onerror = () => {
        // If auto-load fails, prompt user to select the file
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);
            const vid = document.createElement('video');
            vid.src = url;
            vid.muted = true;
            vid.loop = true;
            vid.play();

            const clip = {
                id: state.nextClipId++,
                type: 'video',
                track: 'video1',
                startTime: 0,
                endTime: state.duration,
                label: 'WTKW Background',
                videoSrc: url,
                videoElement: vid
            };

            state.clips = state.clips.filter(c => !(c.type === 'video' && c.track === 'video1' && c.startTime === 0));
            state.clips.push(clip);

            renderTimeline();
            saveToStorage();
        };
        input.click();
    };
}

// ========================================
// ZOOM
// ========================================
function setZoom(value) {
    state.zoom = parseFloat(value);
    renderTimeline();
    renderRuler();
}

// ========================================
// STORAGE
// ========================================
function saveToStorage() {
    const data = {
        format: state.format,
        duration: state.duration,
        previewScale: state.previewScale,
        tracks: state.tracks,
        nextTrackId: state.nextTrackId,
        clips: state.clips.map(c => ({ ...c, videoElement: undefined, audioElement: undefined }))
    };
    localStorage.setItem('berVideoEditor', JSON.stringify(data));
}

function loadFromStorage() {
    const saved = localStorage.getItem('berVideoEditor');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        state.format = data.format || 'vertical';
        state.duration = data.duration || 90;
        state.previewScale = data.previewScale || 1;
        state.clips = data.clips || [];
        state.nextClipId = Math.max(...state.clips.map(c => c.id), 0) + 1;

        // Load tracks if saved
        if (data.tracks && data.tracks.length > 0) {
            state.tracks = data.tracks;
            state.nextTrackId = data.nextTrackId || (Math.max(...state.tracks.map(t => parseInt(t.id.replace(/\D/g, '')) || 0), 0) + 1);
        }

        document.getElementById('durationInput').value = state.duration;
        document.getElementById('previewSizeSlider').value = state.previewScale * 100;
        document.getElementById('previewSizeLabel').textContent = Math.round(state.previewScale * 100) + '%';

        setFormat(state.format);
        renderTracks();
        renderTimeline();
        renderRuler();
        updateTimeDisplay();
    } catch (e) {
        console.error('Failed to load:', e);
    }
}

function saveProject() {
    const data = {
        format: state.format,
        duration: state.duration,
        clips: state.clips.map(c => ({ ...c, videoElement: undefined, audioElement: undefined }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'video-project.json';
    a.click();
}

function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                state.format = data.format || 'vertical';
                state.duration = data.duration || 90;
                state.clips = data.clips || [];
                state.nextClipId = Math.max(...state.clips.map(c => c.id), 0) + 1;

                document.getElementById('durationInput').value = state.duration;
                setFormat(state.format);
                renderTimeline();
                renderRuler();
                updateTimeDisplay();
                saveToStorage();
            } catch (err) {
                alert('Failed to load project');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ========================================
// EXPORT
// ========================================
async function exportVideo() {
    const stream = canvas.captureStream(30);

    // Try multiple codecs, fall back to supported one
    const codecs = [
        'video/webm; codecs=vp9',
        'video/webm; codecs=vp8',
        'video/webm',
        'video/mp4'
    ];

    let selectedMimeType = null;
    for (const codec of codecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
            selectedMimeType = codec;
            console.log('Using codec:', codec);
            break;
        }
    }

    if (!selectedMimeType) {
        alert('No supported video codec found in your browser');
        return;
    }

    const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const ext = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: selectedMimeType.split(';')[0] });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `video-export.${ext}`;
        a.click();
    };

    state.currentTime = 0;
    state.isPlaying = true;
    state.lastFrameTime = performance.now();
    document.getElementById('playBtn').textContent = '⏹️';
    recorder.start();

    setTimeout(() => {
        recorder.stop();
        state.isPlaying = false;
        document.getElementById('playBtn').textContent = '▶';
    }, state.duration * 1000);
}

// Timeline seek
document.getElementById('timelineTracks').addEventListener('click', (e) => {
    if (e.target.classList.contains('track-content')) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pps = 10 * state.zoom;
        state.currentTime = Math.max(0, Math.min(state.duration, x / pps));
        updatePlayhead();
        updateTimeDisplay();
        renderPreview();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'Delete': case 'Backspace': deleteSelected(); break;
        case 'ArrowLeft': state.currentTime = Math.max(0, state.currentTime - 1); updatePlayhead(); updateTimeDisplay(); renderPreview(); break;
        case 'ArrowRight': state.currentTime = Math.min(state.duration, state.currentTime + 1); updatePlayhead(); updateTimeDisplay(); renderPreview(); break;
        case 's': case 'S': splitSelectedClip(); break;
    }
});

// ========================================
// RESET PROJECT
// ========================================
function resetProject() {
    if (!confirm('Reset entire project? This will clear all clips and tracks.')) return;

    // Stop any playing audio
    state.clips.filter(c => c.audioElement).forEach(c => {
        c.audioElement.pause();
        c.audioElement = null;
    });

    // Reset state
    state.clips = [];
    state.nextClipId = 1;
    state.selectedClip = null;
    state.currentTime = 0;
    state.duration = 90;
    state.captionWords = [];
    state.captionAudio = null;

    // Reset tracks to default
    state.tracks = [
        { id: 'video1', name: 'BG Video', type: 'video', order: 0 },
        { id: 'video2', name: 'Overlay Vid', type: 'video', order: 1 },
        { id: 'text1', name: 'Text 1', type: 'overlay', order: 2 },
        { id: 'text2', name: 'Text 2', type: 'overlay', order: 3 },
        { id: 'captions', name: 'Captions', type: 'caption', order: 4 },
        { id: 'voiceover', name: 'Voiceover', type: 'audio', order: 5 },
        { id: 'audio1', name: 'Audio 1', type: 'audio', order: 6 },
        { id: 'effects', name: 'FX', type: 'effects', order: 7 }
    ];
    state.nextTrackId = 3;

    document.getElementById('durationInput').value = state.duration;

    localStorage.removeItem('berVideoEditor');

    renderTracks();
    renderTimeline();
    renderRuler();
    renderPreview();
    renderProperties();
    updateTimeDisplay();
}

// ========================================
// CAPTION SYSTEM - TikTok Style with Sync Mode
// ========================================
let captionAudioElement = null;
let syncMode = {
    active: false,
    words: [],
    currentIndex: 0,
    timings: [],
    startTime: 0
};

function openCaptionModal() {
    document.getElementById('captionModal').classList.add('active');
    resetCaptionSync();
}

function closeCaptionModal() {
    document.getElementById('captionModal').classList.remove('active');
    stopCaptionSync();
}

function handleCaptionAudioUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    captionAudioElement = new Audio(url);

    captionAudioElement.onloadedmetadata = () => {
        const duration = captionAudioElement.duration;
        document.getElementById('captionAudioStatus').textContent =
            `✓ ${file.name} (${duration.toFixed(1)}s)`;
        document.getElementById('captionAudioStatus').style.color = 'var(--success)';
    };

    captionAudioElement.onended = () => {
        stopCaptionSync();
    };
}

function startCaptionSync() {
    const transcript = document.getElementById('captionTranscript').value.trim();
    if (!transcript) {
        alert('Please paste your transcript first');
        return;
    }
    if (!captionAudioElement) {
        alert('Please upload audio first');
        return;
    }

    // Parse words
    syncMode.words = transcript.split(/\s+/).filter(w => w.length > 0);
    syncMode.currentIndex = 0;
    syncMode.timings = [];
    syncMode.active = true;
    syncMode.startTime = 0;

    // Update UI
    state.currentTime = 0;
    state.isPlaying = true;
    state.lastFrameTime = performance.now();
    captionAudioElement.currentTime = 0;
    captionAudioElement.play();

    document.getElementById('panelSyncStartBtn').style.display = 'none';
    document.getElementById('panelSyncStopBtn').style.display = 'inline-block';
    document.getElementById('panelSyncStatus').style.display = 'block';

    updateSyncDisplay();

    // Add keyboard listener
    document.addEventListener('keydown', handleSyncKeydown);
}

function stopCaptionSync() {
    syncMode.active = false;
    if (captionAudioElement) {
        captionAudioElement.pause();
    }

    document.getElementById('panelSyncStartBtn').style.display = 'inline-block';
    document.getElementById('panelSyncStopBtn').style.display = 'none';

    // Remove keyboard listener
    document.removeEventListener('keydown', handleSyncKeydown);

    // Complete any remaining words with estimated timing
    if (syncMode.timings.length > 0 && syncMode.timings.length < syncMode.words.length) {
        const lastTime = syncMode.timings[syncMode.timings.length - 1];
        const remainingWords = syncMode.words.length - syncMode.timings.length;
        const audioDuration = captionAudioElement ? captionAudioElement.duration : lastTime + 5;
        const remainingDuration = audioDuration - lastTime;
        const avgDuration = remainingDuration / remainingWords;

        for (let i = syncMode.timings.length; i < syncMode.words.length; i++) {
            syncMode.timings.push(lastTime + ((i - syncMode.timings.length + 1) * avgDuration));
        }

        document.getElementById('syncProgress').textContent =
            `${syncMode.words.length} / ${syncMode.words.length} words synced ✓`;
    }
}

function resetCaptionSync() {
    stopCaptionSync();
    syncMode.words = [];
    syncMode.currentIndex = 0;
    syncMode.timings = [];

    document.getElementById('syncStatus').style.display = 'none';
    document.getElementById('syncCurrentWord').textContent = '---';
    document.getElementById('syncProgress').textContent = '0 / 0 words synced';
}

function handleSyncKeydown(e) {
    if (!syncMode.active) return;
    // Use Enter key instead of Space (Space is used for play/pause)
    if (e.code !== 'Enter' && e.key !== 'Enter') return;

    e.preventDefault();

    if (syncMode.currentIndex < syncMode.words.length) {
        // Record timing for current word
        const currentTime = captionAudioElement.currentTime;
        syncMode.timings.push(currentTime);
        syncMode.currentIndex++;

        updateSyncDisplay();

        // Check if done
        if (syncMode.currentIndex >= syncMode.words.length) {
            stopCaptionSync();
            document.getElementById('syncProgress').textContent =
                `${syncMode.words.length} / ${syncMode.words.length} words synced ✓`;
        }
    }
}

function toggleCaptionPanel() {
    const panel = document.getElementById('captionPanel');
    const isHidden = panel.style.width === '0px' || panel.style.width === '';
    panel.style.width = isHidden ? '320px' : '0';
    panel.style.borderRight = isHidden ? '1px solid var(--surface-light)' : 'none';
}

function openCaptionModal() {
    toggleCaptionPanel();
}

function updateSyncDisplay() {
    const current = syncMode.words[syncMode.currentIndex] || '(done)';
    const next = syncMode.words[syncMode.currentIndex + 1] || '';
    const next2 = syncMode.words[syncMode.currentIndex + 2] || '';

    // Update panel sync status
    const currentEl = document.getElementById('panelSyncCurrentWord');
    const progressEl = document.getElementById('panelSyncProgress');

    if (currentEl) currentEl.textContent = current;
    if (progressEl) {
        progressEl.textContent =
            `${syncMode.currentIndex} / ${syncMode.words.length} words synced` +
            (next ? ` | Next: ${next}${next2 ? ', ' + next2 : ''}` : '');
    }
}

function generateCaptions() {
    const transcript = document.getElementById('panelTranscript').value.trim();
    if (!transcript) {
        alert('Please enter a transcript');
        return;
    }

    const style = document.getElementById('panelCaptionStyle').value;
    const font = document.getElementById('panelCaptionFont').value;
    const fontSize = parseInt(document.getElementById('panelCaptionFontSize').value) || 48;

    // Parse words
    const words = transcript.split(/\s+/).filter(w => w.length > 0);

    // Use synced timings if available, otherwise auto-generate
    let wordTimings;
    const audioDuration = captionAudioElement ? captionAudioElement.duration : 30;

    if (syncMode.timings.length >= words.length) {
        // Use synced timings - each timing is when the word STARTS
        wordTimings = words.map((word, i) => {
            const startTime = syncMode.timings[i];
            const endTime = (i < words.length - 1) ? syncMode.timings[i + 1] : audioDuration;
            return { word, startTime, endTime, index: i };
        });
        console.log('Using synced timings');
    } else {
        // Auto-generate even timing
        const avgWordDuration = audioDuration / words.length;
        wordTimings = words.map((word, i) => ({
            word,
            startTime: i * avgWordDuration,
            endTime: (i + 1) * avgWordDuration,
            index: i
        }));
        console.log('Using auto timings (sync not completed)');
    }

    state.captionWords = wordTimings;

    // Create caption clip
    const captionClip = {
        id: state.nextClipId++,
        type: 'caption',
        track: 'captions',
        startTime: 0,
        endTime: audioDuration,
        label: 'Captions',
        words: wordTimings,
        style: style,
        fontFamily: font,
        fontSize: fontSize,
        color: '#ffffff',
        highlightColor: '#FFE135',
        wordsPerScreen: 4
    };

    state.clips.push(captionClip);

    // Add voiceover audio if uploaded
    if (captionAudioElement) {
        const audioClip = {
            id: state.nextClipId++,
            type: 'audio',
            track: 'voiceover',
            startTime: 0,
            endTime: audioDuration,
            label: 'Voiceover',
            audioSrc: captionAudioElement.src,
            audioElement: captionAudioElement
        };
        state.clips.push(audioClip);
    }

    // Close panel
    toggleCaptionPanel();
    renderTracks();
    renderTimeline();
    renderRuler();
    saveToStorage();

    console.log(`Generated captions: ${words.length} words, ${style} style`);
}

// Render TikTok-style captions
function renderCaptions(clip) {
    if (!clip.words || clip.words.length === 0) return;

    const currentTime = state.currentTime;
    const wordsPerGroup = clip.wordsPerScreen || 4;

    // Group words into chunks that stay on screen together
    const wordGroups = [];
    for (let i = 0; i < clip.words.length; i += wordsPerGroup) {
        const group = clip.words.slice(i, Math.min(i + wordsPerGroup, clip.words.length));
        wordGroups.push({
            words: group,
            startTime: group[0].startTime,
            endTime: group[group.length - 1].endTime,
            startIndex: i
        });
    }

    // Find which group should be displayed based on current time
    let currentGroup = null;
    let currentWordIndex = -1;

    for (const group of wordGroups) {
        if (currentTime >= group.startTime && currentTime < group.endTime) {
            currentGroup = group;
            break;
        }
    }

    if (!currentGroup) return;

    // Find which word within the group is currently being spoken
    for (const word of currentGroup.words) {
        if (currentTime >= word.startTime && currentTime < word.endTime) {
            currentWordIndex = word.index;
            break;
        }
    }

    ctx.save();

    const fontSize = clip.fontSize || 48;
    const fontFamily = clip.fontFamily || 'Bebas Neue';
    ctx.font = `bold ${fontSize}px '${fontFamily}'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Position based on clip's posY property (default 78%)
    const centerY = canvas.height * ((clip.posY || 78) / 100);

    // Calculate total width of the group
    let totalWidth = 0;
    const wordWidths = currentGroup.words.map(w => {
        const width = ctx.measureText(w.word).width;
        totalWidth += width + 20; // 20px gap
        return width;
    });
    totalWidth -= 20; // Remove last gap

    // Check if width exceeds canvas, scale down if needed
    const maxWidth = canvas.width * 0.9;
    const scaleFactor = totalWidth > maxWidth ? maxWidth / totalWidth : 1;

    let x = (canvas.width - (totalWidth * scaleFactor)) / 2;

    currentGroup.words.forEach((wordObj, i) => {
        const isCurrentWord = wordObj.index === currentWordIndex;
        const isPastWord = wordObj.index < currentWordIndex;
        const wordWidth = wordWidths[i] * scaleFactor;
        const wordX = x + wordWidth / 2;

        // Animation based on style
        let scale = scaleFactor;
        let yOffset = 0;
        let wordColor = clip.color || '#ffffff';

        switch (clip.style) {
            case 'tiktok':
                // Highlight current word with yellow color and slight scale
                if (isCurrentWord) {
                    wordColor = clip.highlightColor || '#FFE135';
                    scale = scaleFactor * 1.2;
                } else if (isPastWord) {
                    wordColor = 'rgba(255,255,255,0.7)';
                }
                break;

            case 'bounce':
                // Bounce the current word
                if (isCurrentWord) {
                    const progress = (currentTime - wordObj.startTime) / (wordObj.endTime - wordObj.startTime);
                    yOffset = -Math.sin(progress * Math.PI) * 12;
                    scale = scaleFactor * (1 + Math.sin(progress * Math.PI) * 0.15);
                    wordColor = clip.highlightColor || '#FFE135';
                } else if (isPastWord) {
                    wordColor = 'rgba(255,255,255,0.7)';
                }
                break;

            case 'karaoke':
                // Color fill effect - past words and current word are colored
                if (isCurrentWord || isPastWord) {
                    wordColor = clip.highlightColor || '#00A6CE';
                } else {
                    wordColor = 'rgba(255,255,255,0.4)';
                }
                break;

            case 'subtitle':
                // Simple subtitle - all same color, no highlighting
                break;
        }

        // Draw word
        ctx.save();
        ctx.translate(wordX, centerY + yOffset);

        const effectiveFontSize = fontSize * scale;
        ctx.font = `bold ${effectiveFontSize}px '${fontFamily}'`;

        // Text stroke for visibility
        ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        ctx.lineWidth = Math.max(4, effectiveFontSize / 12);
        ctx.strokeText(wordObj.word, 0, 0);

        // Fill
        ctx.fillStyle = wordColor;
        ctx.fillText(wordObj.word, 0, 0);

        ctx.restore();

        x += wordWidth + (20 * scaleFactor);
    });

    ctx.restore();
}
