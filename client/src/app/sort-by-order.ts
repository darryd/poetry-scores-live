import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
    name: "sortByOrder"
})
export class SortByOrder implements PipeTransform {
    transform(array: any, field: string): any[] {
        if (!Array.isArray(array)) {
            return;
        }
        array.sort((a: any, b: any) => {
            if (a.object.order && b.object.order) {
                return a.object.order - b.object.order
            } else {
                return 0
            }
        })
    }
}