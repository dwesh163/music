import { checkAccreditation, getUser } from '@/lib/auth';
import { getTrackFile } from '@/lib/spotdl';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: any) {
	try {
		const { trackId } = await context.params;

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('musics:play'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		const songBuffer = await getTrackFile(trackId);

		if (!songBuffer) {
			return NextResponse.json({ message: 'Track not found.' }, { status: 404 });
		}

		const response = new NextResponse(songBuffer, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Content-Disposition': `inline; filename="track-${trackId}.mp3"`,
			},
		});

		return response;
	} catch (error) {
		console.error('Track download failed:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
