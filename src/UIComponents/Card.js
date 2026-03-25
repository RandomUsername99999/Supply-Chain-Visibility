export default function CustomCard({ title, value, info, width, height, children }) {
    return (
        <div className={`bg-white border-amber-950 border-2 rounded-lg justify-start pl-2 m-4 flex flex-col ${!width && !height ? 'w-60 h-20' : ''}`} style={{ width, height }}>
            <p className=''>{title}</p>
            {value && <p className='text-amber-900 font-bold text-xl'>{value}</p>}
            {info && <p className='text-gray-600 text-xs'>{info}</p>}
            {children}
        </div>
    )
}