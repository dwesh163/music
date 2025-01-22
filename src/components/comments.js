import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Comments() {
	const [text, setText] = useState('');
	const [status, setStatus] = useState('');

	const handleTextChange = (event) => {
		setText(event.target.value);
	};

	const handleSubmit = async () => {
		try {
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ comment: text }),
			});

			const data = await response.json();

			if (data.status == 'ok') {
				setStatus('Comment posted successfully');
				setText('');
			} else if (data.error) {
				setStatus(data.error);
			} else {
				setStatus('Failed to post comment');
			}
		} catch (error) {
			console.error('Error posting comment:', error);
		}
	};

	return (
		<div className="w-full">
			<label htmlFor="message" className="block mb-2 text-sm font-medium text-white">
				Your message
			</label>
			<textarea id="message" rows="4" className="focus:outline-none block p-2.5 w-full text-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-[#27272b] border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Write your comment here..." value={text} onChange={handleTextChange}></textarea>
			<button onClick={handleSubmit} className="mt-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
				Post Comment
			</button>
			<div className="text-white mt-2">{status}</div>
		</div>
	);
}
