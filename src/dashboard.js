

function Dashboard(){
    return (
    <>
    <p className='ml-5 font-extrabold text-xl'>Warehouse Operations Centralized Dashboard</p>
    <div className='flex flex-row'>
        <SmallCard title={"Total Pallets Staged"} value={775} info={"+12.5% this week"} />
        <SmallCard title = "Inventory Accuracy" value = "99.8%" info = "On Target" />
        <SmallCard title={"Average Drivers"} value={"18 min"} info={"On Target"} />
        <SmallCard title = "Averaged Drivers" value = "18 min" info = "18 min vs avg" />
    </div>
    <div className='flex flex-row'>
        <div className='flex flex-col'>
            <CustomCard title={"Loading Bay Monitor"} />
            <CustomCard title={"Picker Performance"} />
        </div>
        <div className='flex flex-col'>
            <CustomCard2 title={"Inventory Alerts"} />
            <CustomCard2 title={"Cold Chain Warnings"} />
            <CustomCard2 title={"Route Progress"} />
        </div>
    </div>
    </>
    )
}

function SmallCard({title, value, info}){
    return (<>
        <div className='bg-white border-amber-950 border-2 w-60 h-20 rounded-lg justify-start pl-2 m-4'>
            <p className=''>{title}</p>
            <p className='text-amber-900 font-bold text-xl'>{value}</p>
            <p className='text-gray-600 text-xs'>{info}</p>
        </div>
    </>)
}

function CustomCard({title}){
    return (<>
        <div className='bg-white border-amber-950 border-2 w-[600px] h-96 rounded-lg justify-start pl-2 m-4'>
            <p className=''>{title}</p>
        </div>
    </>)
}

function CustomCard2({title}){
    return (<>
        <div className='bg-white border-amber-950 border-2 w-[425px] h-52 rounded-lg justify-start pl-2 m-4'>
            <p className=''>{title}</p>
        </div>
    </>)
}

export default Dashboard