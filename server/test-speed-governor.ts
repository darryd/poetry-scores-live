import { SpeedGovernor } from './speed-governor'

export function speedTest() {

    var speedGovernor = new SpeedGovernor()

     setInterval(() => speedGovernor.newTask((key) => {speedGovernor.done(key)}), 0)



}