import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { EmojiService } from 'src/service/emoji.service';
import { MessageService } from 'primeng/api';

interface Column {
  field: string;
  header: string;
  filterMatchMode: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})
export class AppComponent implements OnInit {
  public emojiTree!: TreeNode[];
  public emojiTreeForFilter!: TreeNode[];
  public selectedNode!: TreeNode;
  public emojis!: any[];
  public selectedEmoji!: any;
  public selectedStatus: string[] = ['component', 'fully-qualified', 'minimally-qualified', 'unqualified'];
  public detailedEmoji!: any;

  constructor(
    private emojiService: EmojiService,
    private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.emojiService.getEmoji().then((emojisTree) => {
      this.emojiTree = emojisTree;
      const allcategory: TreeNode = {
        label: 'All Category',
        data: { children: [], data: { type: 'allcategory' } },
        children: [],
        key: 'allcategory',
        expanded: true
      };
      const treeForFilter: TreeNode[] = [allcategory];
      emojisTree.forEach(i => {
        const group: TreeNode = {
          label: i.data['nameEn'],
          data: i,
          children: [],
          key: i.data['id']
        };
        allcategory.children?.push(group);
        allcategory.data.children.push(i);
        i.children?.forEach(j => {
          const subgroup: TreeNode = {
            label: j.data['nameEn'],
            data: j,
            key: j.data['id']
          };
          group.children?.push(subgroup);
        });
      });
      this.emojiTreeForFilter = treeForFilter;
      this.selectedNode = treeForFilter[0];
      this.updateEmojis();
    });
  }

  public updateEmojis(): void {
    const emojis: any[] = [];
    const pushEmojis = (node: TreeNode) => {
      if (node.data['type'] === 'emoji') {
        emojis.push(node.data);
      } else {
        node.children?.forEach(i => {
          pushEmojis(i);
        });
      }
    };
    pushEmojis(this.selectedNode.data);
    this.emojis = emojis;
  }

  public writeText(text: string): void {
    navigator.clipboard.writeText(text);
    this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'Copied!', detail: `"${text}" copied to clipboard.`, sticky: false }, );
  }

  public getSeverity(status: string) {
    switch(status) {
      case 'component':
        return 'success';
      case 'unqualified':
        return 'danger';
      case 'minimally-qualified':
        return 'warning';
    }
    return 'info';
  }

  public onRowSelect(): void {
    this.detailedEmoji = this.selectedEmoji;
  }
  public onRowMouseEnter(emoji: any): void {
    if (!this.selectedEmoji) {
      this.detailedEmoji = emoji;
    }
  }
}
