import { checkAccreditation, getUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { downloadTrack } from '@/lib/spotdl';

export async function GET(req: NextRequest, context: any) {
	try {
		const { trackId } = await context.params;

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('musics:download'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		await downloadTrack(trackId);

		return NextResponse.json({ message: `Track downloaded` });
	} catch (error) {
		console.error('Track download failed:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
