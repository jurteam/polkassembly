// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import NudgeIcon from '~assets/icons/analytics/nudge-icon.svg';
import styled from 'styled-components';

interface INudgeProps {
	text: string;
}

const StyledNudge = styled.div`
	border: 1px solid #796eec !important;
	background-color: #b6b0fb36;
`;
const Nudge = ({ text }: INudgeProps) => {
	return (
		<StyledNudge className='mb-5 flex  items-center gap-1 rounded-lg px-5 py-2'>
			<NudgeIcon className='m-0 h-6 w-6 fill-blue-light-high dark:fill-white' />
			<span className='text-sm font-medium text-blue-light-high dark:text-white'>{text}</span>
		</StyledNudge>
	);
};

export default Nudge;
