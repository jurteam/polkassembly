import { Dropdown, Input, MenuProps } from "antd";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useGetFilterInUrl from "~src/hooks/useGetFilterInUrl";
import { IPostTag } from "~src/types";
import nextApiClientFetch from "~src/util/nextApiClientFetch";
import { CheckOutlineIcon, CheckedIcon, FilterIcon, FilterUnfilledIcon, SearchIcon, TrendingIcon } from "./CustomIcons";
import ClearIcon from '~assets/icons/close.svg';
import { poppins } from "pages/_app";

interface Props {
  className?:string;
}

const FilterByTags=({className}:Props)=>{
    const defaultTags=useGetFilterInUrl();
   const [openFilter,setOpenFilter]=useState<boolean>(false);
  const [filteredTags,setFilteredTags]=useState<IPostTag[]>([]);
  const [allTags,setAllTags]=useState<IPostTag[]>([]);
  const [searchInput,setSearchInput]=useState('');
  const [tags,setTags]=useState<string[]>([]);
  const [trendingTags,setTrendingTags]=useState<IPostTag[]>([]);
  const router=useRouter();

   const handleFilterByClick = (key:string[]) => {
    if(key.length>0){
      router.replace({
			pathname:'',
			query:{
        ...router.query,
				filterBy:encodeURIComponent(JSON.stringify(key))
			}
		})}else if(router.query.sortBy){
      router.replace({pathname:'',
      query:{
        sortBy:router.query.sortBy
    }
    })
    }else{
      router.push({pathname:''})
    }
	};


const getData=async()=>{
	const { data , error } = await nextApiClientFetch<IPostTag[]>('api/v1/all-tags');
		if(error) console.error('Error in getting all-tags', error);
    else if(data ){setAllTags(data);setTrendingTags(data);}
}

const handleExits=(value:string)=>{
  value=value.toLowerCase();
 const isExits= tags.filter((tag)=>tag === value);
if(isExits.length>0)return true;
return false;
}

const handleSetTags=(tag:string)=>{
if (tag && tags.indexOf( tag.toLowerCase() ) === -1 && tags.length<5){
      setTags([...tags, tag.toLowerCase()]);
      handleFilterByClick([...tags, tag.toLowerCase()]);
    }
    return
}

const handleRemoveTag=(removedTag:string)=>{
  const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags)
     handleFilterByClick(newTags);
}
 useEffect(()=>{
   allTags.length === 0 && getData();
   setTags(defaultTags)
  },[defaultTags]);

  
const handleFilterResults=(defaultTags:IPostTag[],setDefaultTag:(string:IPostTag[])=>void)=>{
  let keyword=searchInput.toLowerCase();
  const filteresData=defaultTags.filter((tag)=>{
     let item = tag.name.toLowerCase();
       return item.indexOf(keyword) > -1;
})
const data=filteresData.filter((item)=>{
  let count=0;
  tags.map((tag)=>{
    if(item.name === tag)count++;
  })
  if(count === 0)return item;
})
setDefaultTag(data);
}

useEffect(()=>{
  handleFilterResults(allTags,setFilteredTags);
  handleFilterResults(trendingTags,setTrendingTags);
},[searchInput,tags]);

  const items:MenuProps['items']=[
  {key:1 ,label:<div className={`text-color cursor-auto flex text-sm justify-between font-medium mb-[-6px] mt-[-2px] ${poppins.variable} ${poppins.className}`}>Tags <span className='text-pink_primary font-normal text-[10px] flex justify-center cursor-pointer' onClick={()=>{setTags([]);handleFilterByClick([]);setSearchInput('')}}>Clear Filters</span></div>},
  {key:2,label:<Input allowClear={{clearIcon:<ClearIcon/>}} type='search' value={searchInput} onChange={(e)=>setSearchInput(e.target.value)} prefix={<SearchIcon/>} />}, 
 ...tags.map((tag,index)=>{return {key:index+3,label:<div className='flex items-center justify-between boder-solid'><div><SearchIcon className='mr-2'/><span className={`${poppins.variable} ${poppins.className} text-navBlue text-sm`}>{tag.charAt(0).toUpperCase()+tag.slice(1)}</span></div><div>{handleExits(tag)?<div onClick={()=>handleRemoveTag(tag)}><CheckedIcon className='mt-[-2px]'/></div>:<div onClick={()=>handleSetTags(tag)}><CheckOutlineIcon className='mt-[-2px]'/></div>}</div></div>}}),
  ...trendingTags.slice(0,5).map((tag,index)=>{if(searchInput.length === 0 && tags.length === 0 && filteredTags.length === 0){return {key:index+10,label:<div onClick={()=>handleSetTags(tag?.name)} className={`flex gap-2 text-sm items-center ${poppins.className} ${poppins.variable}`}><TrendingIcon/><span className='text-sm text-navBlue'>{tag?.name.charAt(0).toUpperCase()+tag?.name.slice(1)}</span></div>}}return null;}),
...filteredTags.slice(0,5).map((tag,index)=>{
  return {key:index+20,label:<div className='flex items-center justify-between'><div><SearchIcon className='mr-2'/><span className={`${poppins.variable} ${poppins.className} text-navBlue text-sm`}>{tag?.name?.charAt(0).toUpperCase()+tag?.name.slice(1)}</span></div><div>{!handleExits(tag?.name) && <div onClick={()=>handleSetTags(tag?.name)}><CheckOutlineIcon className='mt-[-2px]'/></div>}</div></div>}
})
]
  return (
  <Dropdown
  menu={{items}}
  open={openFilter}
  className={className}
  overlayClassName='background-change'
  onOpenChange={()=>setOpenFilter(!openFilter)}
  placement="bottomRight"
  ><div className={`text-sm tracking-wide font-normal flex items-center ${openFilter ? 'text-pink_primary':'text-grey_primary'} mt-[2px] cursor-pointer`}>Filter<span className='text-xl ml-2 mt-[2px]'>{openFilter?<FilterIcon/>:<FilterUnfilledIcon/>}</span></div>
  </Dropdown> )
}
export default FilterByTags;