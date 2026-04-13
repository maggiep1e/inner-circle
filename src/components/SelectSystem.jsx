import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import { resolveAvatar } from "../api/avatar";
import Card from "./Card";
import { useNavigate } from "react-router-dom";

export default function SelectSystem({ systems, onSelect }) {

    const navigate = useNavigate();
    const currentSystem = useSystemStore((s) => s.currentSystem);
    const user = useSessionStore((s) => s.user);
    const systemsFromStore = useSystemStore((s) => s.systems);


    return (

       <Card>
            <h2 className="text-xl font-bold p-2">Select System</h2>
       
                 {systemsFromStore?.map((sys) => {
                     if (currentSystem === sys) return (
       
                     <div key={sys.id }className="rounded border-4 border-green-500">
                     <div
                       onClick={() => onSelect(sys.id)}
                       className=" cursor-pointer shadow-sm transition flex flex-col gap-2 p-2"
                       style={{ backgroundColor: sys.color || "#ffffff"}}
                     >
         
                       <div className="flex items-center gap-3">
                         <img
                           src={resolveAvatar(sys?.avatar)}
                           alt="system avatar"
                           className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                         />
       
                         <div className="font-semibold">
                           <p>{sys.name || "Unnamed System"}</p>
                         </div>
                       </div>
                     </div>
                     </div>
                    
                   ); else return (
                     <div key={sys.id} className="py-1">
                     <div
                       onClick={() => onSelect(sys.id)}
                       className="p-3 rounded cursor-pointer shadow-sm hover:opacity-90 transition flex flex-col gap-2"
                       style={{ backgroundColor: sys.color || "#ffffff" }}
                     >
         
                       <div className="flex items-center gap-3">
                         <img
                           src={resolveAvatar(sys?.avatar)}
                           alt="system avatar"
                           className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                         />
       
                         <div className="font-semibold">
                           <p>{sys.name || "Unnamed System"}</p>
                         </div>
                       </div>
       
                     </div>
                     </div>
                   )
                 })}
       
                 <button
                   onClick={() => navigate("/systems/new")}
                   className="mt-3 w-full bg-green-500 text-white px-3 py-2 rounded"
                 >
                   + Create System
                 </button>
               </Card>
    )
}