// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ProfileHeader from './ProfileHeader';
import { ESocialType, ProfileDetailsResponse } from '~src/auth/types';
import { DeriveAccountRegistration } from '@polkadot/api-derive/accounts/types';
import { useApiContext } from '~src/context';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector } from '~src/redux/selectors';
import ProfileCard from './ProfileCard';
import classNames from 'classnames';
import ProfileStatsCard from './ProfileStatsCard';
import ProfileTabs from './ProfileTabs';
import { useTheme } from 'next-themes';

interface Props {
	className?: string;
	userProfile: ProfileDetailsResponse;
}

export type TOnChainIdentity = { nickname: string } & DeriveAccountRegistration;

const PAProfile = ({ className, userProfile }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { resolvedTheme: theme } = useTheme();
	const [onChainIdentity, setOnChainIdentity] = useState<TOnChainIdentity>({
		judgements: [],
		nickname: ''
	});
	const [addressWithIdentity, setAddressWithIdentity] = useState<string>('');
	const [profileDetails, setProfileDetails] = useState<ProfileDetailsResponse>({
		addresses: [],
		badges: [],
		bio: '',
		image: '',
		social_links: [],
		title: '',
		user_id: 0,
		username: ''
	});

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribes: (() => void)[];
		const onChainIdentity: TOnChainIdentity = {
			judgements: [],
			nickname: ''
		};
		const resolved: any[] = [];
		profileDetails?.addresses.forEach((address) => {
			api.derive.accounts
				.info(`${address}`, (info) => {
					const { identity } = info;
					if (info.nickname && !onChainIdentity.nickname) {
						onChainIdentity.nickname = info.nickname;
					}
					Object.entries(identity).forEach(([key, value]) => {
						if (value) {
							if (Array.isArray(value) && value.length > 0 && (onChainIdentity as any)?.[key]?.length === 0) {
								(onChainIdentity as any)[key] = value;
								setAddressWithIdentity(getEncodedAddress(address, network) || '');
							} else if (!(onChainIdentity as any)?.[key]) {
								(onChainIdentity as any)[key] = value;
								setAddressWithIdentity(getEncodedAddress(address, network) || '');
							}
						}
					});
					resolved.push(true);
					if (resolved.length === profileDetails?.addresses.length) {
						setOnChainIdentity(onChainIdentity);
					}
				})
				.then((unsub) => {
					unsubscribes?.push(unsub);
				})
				.catch((e) => console.error(e));
		});

		return () => {
			unsubscribes && unsubscribes.length > 0 && unsubscribes.forEach((unsub) => unsub && unsub());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profileDetails?.addresses, api, apiReady]);

	useEffect(() => {
		const { email, twitter, riot, web } = onChainIdentity;

		if (onChainIdentity && (email || twitter || web || riot)) {
			const social_links = userProfile.social_links || [];
			let isEmailAvailable = false;
			let isTwitterAvailable = false;
			let isRiotAvailable = false;
			social_links.forEach((v) => {
				switch (v.type) {
					case ESocialType.EMAIL:
						isEmailAvailable = true;
						break;
					case ESocialType.TWITTER:
						isTwitterAvailable = true;
						break;
					case ESocialType.RIOT:
						isRiotAvailable = true;
				}
			});
			if (email && !isEmailAvailable) {
				social_links.push({
					link: email,
					type: ESocialType.EMAIL
				});
			}
			if (twitter && !isTwitterAvailable) {
				social_links.push({
					link: `https://twitter.com/${twitter}`,
					type: ESocialType.TWITTER
				});
			}
			if (riot && !isRiotAvailable) {
				social_links.push({
					link: `https://matrix.to/#/${riot}`,
					type: ESocialType.RIOT
				});
			}
			setProfileDetails((prev) => {
				return {
					...prev,
					social_links: social_links
				};
			});
		} else {
			setAddressWithIdentity(userProfile?.addresses?.[0] || '');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onChainIdentity, userProfile]);

	return (
		<div className={classNames(className, 'flex flex-col gap-6')}>
			<ProfileHeader
				userProfile={userProfile}
				profileDetails={profileDetails}
				setProfileDetails={setProfileDetails}
				addressWithIdentity={addressWithIdentity}
			/>
			<ProfileCard
				className='max-md:mt-[200px]'
				userProfile={userProfile}
				addressWithIdentity={addressWithIdentity}
				onchainIdentity={onChainIdentity}
			/>
			<ProfileStatsCard userProfile={userProfile} />
			<ProfileTabs
				userProfile={userProfile}
				theme={theme}
			/>
		</div>
	);
};

export default PAProfile;
