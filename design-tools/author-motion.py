"""Run with Blender: blender -b --factory-startup --python author-motion.py -- OUTPUT_DIR.

The Blender F-curves are the source of truth for the live DOM choreography.
Exported normalized progress is sampled at 60 fps, interpolated by the browser's
Web Animations compositor, and applied to existing live text and photos.
"""
import bpy, json, sys
from bpy_extras import anim_utils
from pathlib import Path

out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.fps = 60
scene.frame_start = 1
scene.frame_end = 96
tracks = {
    'headline': (58, (.18, .88), (.25, 1.0)),
    'photo': (82, (.16, .75), (.26, 1.0)),
    'support': (45, (.18, .80), (.28, 1.0)),
    'band': (57, (.22, .82), (.30, 1.0)),
    'reveal': (39, (.20, .75), (.28, 1.0)),
}
export = {'version':1, 'authoring':f'Blender {bpy.app.version_string} F-curves', 'fps':60, 'tracks':{}}
for row, (name, (frames, h1, h2)) in enumerate(tracks.items()):
    obj = bpy.data.objects.new(name, None)
    scene.collection.objects.link(obj)
    obj.empty_display_type = 'PLAIN_AXES'
    obj.location.y = row * 2
    obj.location.x = 0
    obj.keyframe_insert(data_path='location', index=0, frame=1)
    obj.location.x = 1
    obj.keyframe_insert(data_path='location', index=0, frame=frames + 1)
    channels = anim_utils.action_get_channelbag_for_slot(obj.animation_data.action, obj.animation_data.action_slot)
    curve = channels.fcurves.find('location', index=0)
    a, b = curve.keyframe_points
    for key in (a, b):
        key.interpolation = 'BEZIER'
        key.handle_left_type = 'FREE'
        key.handle_right_type = 'FREE'
    a.handle_right = (1 + frames*h1[0], h1[1])
    b.handle_left = (1 + frames*h2[0], h2[1])
    curve.update()
    export['tracks'][name] = {'duration':round(frames / 60 * 1000), 'progress':[round(curve.evaluate(1+i), 6) for i in range(frames+1)]}
    obj['web_role'] = name
    obj['note'] = 'Normalized progress; live web elements preserve approved geometry and typography.'
scene['project'] = 'Sport My Fitness — shared entrance and reveal choreography'
scene['accessibility'] = 'Web controller honors reduced motion and immediate user interaction.'
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'sport-my-fitness-motion.blend'))
(out / 'smf-motion-curves.json').write_text(json.dumps(export, separators=(',', ':')) + '\n')
print('SMF_MOTION_EXPORT_OK', len(export['tracks']))
