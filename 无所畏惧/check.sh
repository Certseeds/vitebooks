#!/usr/bin/env bash
set -euo pipefail
# set -x
main() {
    local array=(
        "第八军团"
        "【"
        "】"
        "“"
        "”"
        "。"
        "，"
        "？"
        "（"
        "）"
        "："
        "！"
        "；"
        "‘"
        "’"
        "罗保特"
        "古里曼"
        "荷露斯"
        "马格纳斯"
        "弗格瑞姆"
        "莫塔瑞恩"
        "科尔兹"
        "沃坎"
        "曼努斯"
        "佩特拉波"
        "洛加"
        " "
    )
    for item in "${array[@]}"; do
        echo "${item}"
        cat \
            ./**/*.md \
            ./base.md \
            ./organize.md |
            grep "${item}" |
            wc || true
    done

}
main
