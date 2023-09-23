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
                const customize = (node: TreeNode, parent: TreeNode|null) => {
                    if (node.data['type'] === 'group') {
                        node.expanded = true;
                    } else if (node.data['type'] === 'subgroup') {
                        node.expanded = true;
                        node.data['parent'] = parent;
                    } else {
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
                        node.data['parent'] = parent;
                    }
                    for (let next of node.children || []) {
                        customize(next, node);
                    }
                };
                for (let emoji of emojis) {
                    customize(emoji, null);
                }
                resolve(emojis);
            })
        });
    }
}
