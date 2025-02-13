import { pageDataItem, useCoreStore } from '@/stores/core';
import { defineComponent, onMounted } from 'vue'
import css from './index.module.scss';
import { VueDraggableNext } from 'vue-draggable-next'
import { useBoardStore } from '@/stores/board';
import domtoimage from 'dom-to-image'
import { deepClone, imgToFile, imgToStorage } from '@/utils';

export default defineComponent({
  components: {
    draggable: VueDraggableNext,
  },
  setup() {
    const board = useBoardStore()
    const core = useCoreStore()
    onMounted(() => {
      console.log(core.pageData);
    })
    function addPage() {
      core.addPage()
    }
    /**
     * 切换页面
     * @param index 
     */
    async function changePageIndex(item, index) {
      console.log('触发了切换页面?', item);
      if (core.acPageIndex != index) {
        // 存储当前要生成缩略图的下标
        // let oldIndex = deepClone(core.acPageIndex)
        // core.resetCompActive()
        // let file = await imgToFile(board)
        // core.acPageIndex = index
        // let url = await imgToStorage(file, `${board.pageDataId}_thmb&${item.id}&`, 'thmbImg')
        // board.pageDetail.tumbUrl[oldIndex] = url
        // console.log(board.pageDetail.tumbUrl);


        core.resetCompActive()
        core.acPageIndex = index
      }
    }
    function dragStart(evt) {
      core.resetCompActive()
    }
    function dragEnd(evt) {
      if (core.acPageIndex == evt.oldIndex) {
        core.acPageIndex = evt.newIndex
      } else if (core.acPageIndex == evt.newIndex) {
        core.acPageIndex = evt.oldIndex
      }
    }
    function deletePage(index) {
      core.pageData.splice(index, 1)
    }
    function insertPage(index) {
      core.pageData.splice(index, 0, pageDataItem())
    }
    return () => (
      <div class={css.page_list}>
        {
          board.pageDetail.pageType == 2 && (<div class={css.add_page_cont}>
            <a-button class={css.add_page} onClick={addPage} type="primary">增加页面</a-button>
          </div>)
        }
        <draggable class={css.page_main} v-model={[core.pageData]} animation={300} onStart={dragStart} onEnd={dragEnd}>
          {
            core.pageData.map((item, index) => (
              <div
                class={[css.page_item, index == core.acPageIndex ? css.active_item : '']}
                onClick={() => changePageIndex(item, index)}
              >
                <div class={css.item_index}>{index + 1}</div>
                {
                  board.pageDetail.tumbUrl.filter(e => e.split('&')[1] == item.id).length > 0 ? (
                    <img class={css.item_core} src={`${board.pageDetail.tumbUrl[index]}?t=${new Date().getTime()}`} />
                  ) : (
                    <div class={[css.item_core, index == core.acPageIndex ? css.active_core : '']} > </div>
                  )
                }
                <div class={css.item_action}>
                  {/* <div class={css.action_active}>1</div>
                  <div class={css.action_active}>1</div>
                  <div class={css.action_active}>1</div> */}
                  <div class={css.action_active} onClick={() => deletePage(index)}>
                    <svg-icon class={css.svg_icon} color={'#2970f6'} name="shanchu" />
                  </div>
                  <div class={css.action_active} onClick={() => insertPage(index)}>
                    <svg-icon class={css.svg_icon} color={'#2970f6'} name="plus" />
                  </div>
                </div>
              </div>
            ))
          }
        </draggable>
      </div>
    )
  }
})
