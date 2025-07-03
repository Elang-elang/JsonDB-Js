import json
import os
from typing import Any, Dict, List, Union, Optional

class JsonDB:
    """
    Class for managing a simple JSON database.
    
    This class provides basic operations such as create, read, 
    update, and delete data in JSON format.
    """
    
    def __init__(self, file_path: str):
        """
        Initialize JSON database.
        
        Args:
            file_path (str): Path to the JSON file to be used as database
        """
        self.file_path = file_path
        self.data = {}
        
        # Create directory if it doesn't exist
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)
        
        # Create empty file if it doesn't exist
        if not os.path.exists(file_path):
            self._save_to_file({})
        
        # Load data from file
        self._load_from_file()
    
    def _load_from_file(self) -> None:
        """Load data from JSON file to memory."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                content = file.read().strip()
                if content:
                    self.data = json.loads(content)
                else:
                    self.data = {}
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Warning: Failed to load JSON file. Using empty database. Error: {e}")
            self.data = {}
    
    def _save_to_file(self, data: Dict[str, Any] = None) -> None:
        """
        Save data to JSON file.
        
        Args:
            data (Dict): Data to be saved. If None, use self.data
        """
        save_data = data if data is not None else self.data
        try:
            with open(self.file_path, 'w', encoding='utf-8') as file:
                json.dump(save_data, file, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error: Failed to save to file. {e}")
    
    def create_table(self, table_name: str, initial_data: Any = None) -> bool:
        """
        Create a new table in the database.
        
        Args:
            table_name (str): Name of the table to be created
            initial_data (Any): Initial data for the table (optional)
            
        Returns:
            bool: True if successful, False if table already exists
        """
        if table_name in self.data:
            print(f"Warning: Table '{table_name}' already exists.")
            return False
        
        # If no initial data, create as empty list
        self.data[table_name] = initial_data if initial_data is not None else []
        self._save_to_file()
        return True
    
    def insert_data(self, table_name: str, data: Any) -> bool:
        """
        Add data to table.
        
        Args:
            table_name (str): Table name
            data (Any): Data to be added
            
        Returns:
            bool: True if successful
        """
        if table_name not in self.data:
            print(f"Warning: Table '{table_name}' not found. Creating new table.")
            self.create_table(table_name)
        
        # If table is a list, append data
        if isinstance(self.data[table_name], list):
            self.data[table_name].append(data)
        # If table is dict and data is also dict, update
        elif isinstance(self.data[table_name], dict) and isinstance(data, dict):
            self.data[table_name].update(data)
        # If table is single value, convert to list
        else:
            old_data = self.data[table_name]
            self.data[table_name] = [old_data, data]
        
        self._save_to_file()
        return True
    
    def update_data(self, table_name: str, condition: callable = None, new_data: Any = None) -> bool:
        """
        Update data in table.
        
        Args:
            table_name (str): Table name
            condition (callable): Function to determine which data to update
            new_data (Any): New data
            
        Returns:
            bool: True if successful
        """
        if table_name not in self.data:
            print(f"Error: Table '{table_name}' not found.")
            return False
        
        # If no condition, replace entire data
        if condition is None:
            self.data[table_name] = new_data
        else:
            # For list, update items that meet condition
            if isinstance(self.data[table_name], list):
                for i, item in enumerate(self.data[table_name]):
                    if condition(item):
                        self.data[table_name][i] = new_data
        
        self._save_to_file()
        return True
    
    def delete_data(self, table_name: str, condition: callable = None, delete_all: bool = False) -> bool:
        """
        Delete data from table.
        
        Args:
            table_name (str): Table name
            condition (callable): Function to determine which data to delete
            delete_all (bool): If True, delete all data in table
            
        Returns:
            bool: True if successful
        """
        if table_name not in self.data:
            print(f"Error: Table '{table_name}' not found.")
            return False
        
        if delete_all:
            if isinstance(self.data[table_name], list):
                self.data[table_name].clear()
            elif isinstance(self.data[table_name], dict):
                self.data[table_name].clear()
            else:
                self.data[table_name] = None
        elif condition:
            if isinstance(self.data[table_name], list):
                self.data[table_name] = [item for item in self.data[table_name] if not condition(item)]
        
        self._save_to_file()
        return True
    
    def get_data(self, table_name: str = None) -> Union[Any, Dict[str, Any]]:
        """
        Retrieve data from table or entire database.
        
        Args:
            table_name (str): Table name (optional)
            
        Returns:
            Data from table or entire database
        """
        if table_name is None:
            return self.data
        
        if table_name not in self.data:
            print(f"Warning: Table '{table_name}' not found.")
            return None
        
        return self.data[table_name]
    
    def show_data(self, table_name: str = None) -> None:
        """
        Display data information in readable format.
        
        Args:
            table_name (str): Table name (optional)
        """
        if table_name is None:
            print("=== Entire Database ===")
            for key, value in self.data.items():
                print(f"Table: {key}")
                print(f"Type: {type(value).__name__}")
                if isinstance(value, (list, dict, str)):
                    print(f"Length: {len(value)}")
                print(f"Data: {value}")
                print("-" * 40)
        else:
            if table_name not in self.data:
                print(f"Table '{table_name}' not found.")
                return
            
            data = self.data[table_name]
            print(f"=== Table: {table_name} ===")
            print(f"Type: {type(data).__name__}")
            if isinstance(data, (list, dict, str)):
                print(f"Length: {len(data)}")
            print(f"Data: {data}")
    
    def list_tables(self) -> List[str]:
        """
        Return list of all table names.
        
        Returns:
            List[str]: List of table names
        """
        return list(self.data.keys())
    
    def table_exists(self, table_name: str) -> bool:
        """
        Check if table exists.
        
        Args:
            table_name (str): Table name
            
        Returns:
            bool: True if table exists
        """
        return table_name in self.data
    
    def get_table_info(self, table_name: str) -> Dict[str, Any]:
        """
        Get detailed information about table.
        
        Args:
            table_name (str): Table name
            
        Returns:
            Dict with table information
        """
        if table_name not in self.data:
            return {"exists": False}
        
        data = self.data[table_name]
        return {
            "exists": True,
            "name": table_name,
            "type": type(data).__name__,
            "length": len(data) if isinstance(data, (list, dict, str)) else 0,
            "data": data
        }
