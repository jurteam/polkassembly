// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import ProfileBalances from './ProfileBalance';
import { useUserDetailsContext } from '~src/context';
import styled from 'styled-components';
import { RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

import { GetTracksColumns, handleTracksIcon } from './Coloumn';
import { Skeleton, Table } from 'antd';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';
import { DelegatedIcon } from '~src/ui-components/CustomIcons';
import dynamic from 'next/dynamic';
import { ETrackDelegationStatus, IDelegation } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';

interface Props{
  className?: string;
  posts : any[];
  trackDetails: any;
}

const Delegate = dynamic(() => import('./Delegate'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
const ActiveProposals = dynamic(() => import('./ActiveProposals'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
const WalletConnectModal = dynamic(() => import('./DelegationWalletConnectModal'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

export interface ITrackRowData{
  index: number;
  delegatedTo: string;
  delegatedFrom : string;
  lockPeriod: number;
  balance: string;
  delegatedOn: Date;
  action: string;
}

const DashboardTrackListing = ( { className, posts, trackDetails }: Props ) => {

	const { query : { track } } = useRouter();
	const [status, setStatus] = useState<ETrackDelegationStatus>();
	const router = useRouter();
	const [showTable, setShowTable] = useState<boolean>(false);
	const [delegationDetails, setDelegationDetails] = useState<ITrackDelegation>();
	const { delegationDashboardAddress: address } = useUserDetailsContext();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [rowData, setRowData] = useState<ITrackRowData[]>([]);

	useEffect(() => {
		if(!address){
			setOpenModal(true);
		}
	}, [address]);

	const getData = async() => {
		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>(`api/v1/delegations?address=${'HWyLYmpW68JGJYoVJcot6JQ1CJbtUQeTdxfY1kUTsvGCB1r'}&track=${trackDetails?.trackId}`);

		if(data){
			console.log(data,'fh');
			setDelegationDetails(data[0]);
			const rowData: ITrackRowData[] = data[0]?.delegations?.map((delegation : IDelegation, index: number) => {
				return { action: 'Undelegate', balance:delegation?.balance , delegatedFrom: delegation?.from, delegatedOn: delegation?.createdAt, delegatedTo:delegation?.to, index: index + 1, lockPeriod: delegation?.lockPeriod };
			});

			setRowData(rowData);

			if(data[0].status === ETrackDelegationStatus.Received_Delegation){
				setStatus(ETrackDelegationStatus.Received_Delegation);
			}
			else if( data[0].status === ETrackDelegationStatus.Delegated){
				setStatus(ETrackDelegationStatus.Delegated);
			}
			else if(data[0].status === ETrackDelegationStatus.Undelegated){
				setStatus(ETrackDelegationStatus.Undelegated);
			}

		}else{
			console.log(error);
		}
	};

	const handleReroute = ( route: string ) => {
		if(route.length === 0){
			return;
		}
		route = route.toLowerCase();
		if(route === 'dashboard'){
			router.push('/delegation');
		}else{
			router.push(`/delegation/${route}`);
		}

	};
	const handleTrack = ( track: string ) => {

		const firstPart = track.split('-')[0];
		const secondPart = track.split('-')[1] ? track.split('-')[1] : '';
		const trackName = `${firstPart.charAt(0).toUpperCase() + firstPart.slice(1)} ${secondPart.length > 0 ? secondPart.charAt(0).toUpperCase() + secondPart.slice(1) : ''}`;

		return trackName.trim();

	};

	useEffect(() => {
		!delegationDetails && address && getData();

		if(status === ETrackDelegationStatus.Delegated){
			setShowTable(true);
		}else if(status === ETrackDelegationStatus.Received_Delegation){
			setShowTable(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, address]);

	return <div className={`${className}`}>
		<div className='h-[90px] wallet-info-board rounded-b-[20px] flex gap mt-[-25px] max-lg:w-[99.3vw] max-lg:absolute max-lg:left-0 max-lg:top-[80px]'>
			<ProfileBalances address={address}/>
		</div>
		<div className='flex gap-2 mb-4 md:mb-5 mt-5 dashboard-heading items-center max-lg:pt-[60px]'>
			<span className='text-sm cursor-pointer' onClick={() => handleReroute('dashboard')}>Dashboard</span>
			<span className='mt-[-2px]'>
				<RightOutlined className='text-xs' />
			</span>
			<span className='text-pink_primary text-sm cursor-pointer' onClick={() => handleReroute(String(track))}>
				{handleTrack(String(track))}
			</span>
		</div>
		{status ? <div className='border-solid border-[1px] border-[#D2D8E0] rounded-[14px] py-6 px-9 shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] bg-white'>
			<div className='text-[28px] font-semibold tracking-[0.0015em] text-[#243A57] flex gap-3 items-center'>
				{handleTracksIcon(handleTrack(String(track)))}
				<span>{handleTrack(String(track))}</span>
				<span className={`text-[12px] ${status === ETrackDelegationStatus.Received_Delegation && 'bg-[#E7DCFF]'} ${status === ETrackDelegationStatus.Delegated && 'bg-[#FFFBD8]'} ${status === ETrackDelegationStatus.Undelegated && 'bg-[#FFDAD8]'} rounded-[26px] py-[6px] px-[12px] text-center`}>
					{status && status?.split('_').join(' ').charAt(0).toUpperCase()+status?.split('_').join(' ').slice(1)}
				</span>
			</div>
			<h4 className='mt-[19px] text-sm text-[#243A57] tracking-[0.01em]'>
				{trackDetails.description}
			</h4>
			{  showTable && <div className='bg-white mt-6 border-[1px] border-solid rounded-[6px] pl-[3px] pr-[3px] border-[#D2D8E0] bg-transparent'>
				<Table
					className= 'column'
					columns= { GetTracksColumns(status) }
					dataSource= { rowData }
					pagination={status === ETrackDelegationStatus.Delegated ? false: { pageSize : 5 }}
					loading={!status}
				></Table>
			</div>}
			{status === ETrackDelegationStatus.Undelegated && <div className='bg-white flex pt-[24px] items-center flex-col text-[169px] pb-[33px] rounded-b-[14px]'>
				<DelegatedIcon />
				<div className='text-[#243A57] mt-[18px] text-center'>
					<div className='text-sm tracking-[0.01em] font-normal mt-1 flex justify-center items-center max-md:flex-col'>
        Voting power for this track has not been delegated yet
						<div className='text-[#E5007A] font-normal tracking-wide text-sm ml-[11px] flex items-center justify-center  max-md:mt-[10px] cursor-pointer' >
							<DelegatedProfileIcon className='mr-[7px]'/>
							<span className='mt-[1px]'>
               Delegate Track
							</span>
						</div>
					</div>
				</div>
			</div>}
		</div> : <Skeleton/>}
		{status ? <div>
			<ActiveProposals posts={posts} trackDetails={trackDetails} status={status} delegatedBy = {status === ETrackDelegationStatus.Delegated ? rowData[0]?.delegatedTo : null} />
		</div> : <Skeleton/>}
		{ status ? status !== ETrackDelegationStatus.Delegated && <div>
			<Delegate trackDetails={trackDetails}/></div> : <Skeleton/>}
		<WalletConnectModal open={openModal} setOpen={setOpenModal} />
	</div>;
};

export default styled(DashboardTrackListing)`
.wallet-info-board {
  margin-top:0px;
  background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122C 0%, #A6075C 32.81%, #952863 77.08%, #E5007A 100%);
}
.column .ant-table-thead > tr > th{
  color:#485F7D !important;
  font-size: 14px;
  font-weight: 600px;
  line-height: 21px;
}


`;