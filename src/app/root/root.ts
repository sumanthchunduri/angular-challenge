import { Component } from '@angular/core';
import { Part1 } from "../part1/part1";
import { Part2 } from "../part2/part2";

@Component({
  selector: 'app-root',
  imports: [Part1, Part2],
  templateUrl: './root.html',
  styleUrl: './root.scss'
})
export class Root {

}
