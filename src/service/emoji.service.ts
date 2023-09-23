import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { TreeNode } from "primeng/api";



@Injectable()
export class EmojiService {
    constructor(private httpClient: HttpClient) {
    }

    getEmoji(): Promise<TreeNode[]> {
        return new Promise((resolve, reject) => {
            this.httpClient.get('./assets/emoji.json').subscribe((res) => {
                const emojis: TreeNode[] = <TreeNode[]>res;
                const customize = (node: TreeNode) => {
                    if (['group', 'subgroup'].includes(node.data['type'])) {
                        node.expanded = true;
                    } else {
                        node.data['nameEnForFilter'] = (<string[]>node.data['nameEn']).join('\n');
                        node.data['emoji'] =
                            String.fromCodePoint(...(<string[]>node.data['sequence']).map(i => parseInt(i, 16)))
                        node.data['codePointUnicode'] =
                            (<string[]>node.data['sequence']).map(i => 'U+' + i).join('');
                        node.data['codePointCSS'] =
                            (<string[]>node.data['sequence']).map(i => '\\' + i).join('');
                        node.data['codePointJS'] =
                            (<string[]>node.data['sequence']).map(i => '\\u' + i).join('');
                        node.data['codePointHTML'] =
                            (<string[]>node.data['sequence']).map(i => '&#x' + i + ';').join('');
                    }
                    for (let next of node.children || []) {
                        customize(next);
                    }
                };
                for (let emoji of emojis) {
                    customize(emoji);
                }
                resolve(emojis);
            })
        });
    }
}
