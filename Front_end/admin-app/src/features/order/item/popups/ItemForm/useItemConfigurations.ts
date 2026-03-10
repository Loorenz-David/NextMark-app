
import type { ItemType } from "@/features/itemConfigurations/types/itemType"
import { useEffect, useMemo, useState } from "react"

import type { ItemProperty } from "@/features/itemConfigurations/types/itemProperty"
import { useItemTypesOrFetch } from "@/features/itemConfigurations/hooks/useItemTypeFlow"
import { useItemPropertiesOrFetch } from "@/features/itemConfigurations/hooks/useItemPropertyFlow"


export type itemTypeOption = {
  label: string
  value: ItemType
}
export type selectedItemTypeProperties = ItemProperty[]

export const useItemConfigurations = ({
  selectedItemTypeName,
}: {
  selectedItemTypeName?: string | null
}) => {
    const [ selectedItemType, setSelectedItemType ] = useState<ItemType | null>(null)
    
    const itemTypes = useItemTypesOrFetch()
    const itemTypeProperties = useItemPropertiesOrFetch()

    const itemTypeOptions = useMemo(
      () =>
        itemTypes.map((itemType) => ({
          label: itemType.name,
          value: itemType,
        })),
      [itemTypes],
    )
    
    const selectedItemTypeProperties = useMemo(() => {
      const propertyIds = selectedItemType?.properties 
      if (!propertyIds ) return []

      return itemTypeProperties.filter((property) =>
        propertyIds.includes(property.id ?? -1),
      )
    }, [selectedItemType, itemTypeProperties])

    useEffect(() => {
      const normalizedName = selectedItemTypeName?.trim()
      if (!normalizedName) {
        if (selectedItemType !== null) {
          setSelectedItemType(null)
        }
        return
      }

      const matchedItemType =
        itemTypes.find((itemType) => itemType.name === normalizedName) ?? null

      if (!matchedItemType) {
        if (selectedItemType !== null) {
          setSelectedItemType(null)
        }
        return
      }

      if (selectedItemType?.id !== matchedItemType.id) {
        setSelectedItemType(matchedItemType)
      }
    }, [itemTypes, selectedItemType, selectedItemTypeName])
  
   
  return {
    itemTypeOptions,
    selectedItemTypeProperties,
    selectedItemType,
    setSelectedItemType,
  }
}
